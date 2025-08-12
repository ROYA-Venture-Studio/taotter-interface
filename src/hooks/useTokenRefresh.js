import { useEffect, useRef } from "react";
import { useRefreshTokenMutation } from "../store/api/authApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials, logout } from "../store/slices/authSlice";
import { willTokenExpireSoon } from "../utils/tokenUtils";

// Checks token expiry every 5 minutes and refreshes if needed
export default function useTokenRefresh() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const intervalRef = useRef();

  useEffect(() => {
    // Function to check and refresh token
    const checkAndRefresh = async () => {
      if (token && refreshToken && willTokenExpireSoon(token, 10 * 60 * 1000)) {
        try {
          const res = await refreshTokenMutation(refreshToken).unwrap();
          if (res.tokens && res.tokens.accessToken) {
            dispatch(
              setCredentials({
                token: res.tokens.accessToken,
                refreshToken: res.tokens.refreshToken,
              })
            );
          } else {
            dispatch(logout());
          }
        } catch (e) {
          dispatch(logout());
        }
      }
    };

    // Run immediately on mount
    checkAndRefresh();

    // Set interval to check every 5 minutes
    intervalRef.current = setInterval(checkAndRefresh, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [token, refreshToken, dispatch, refreshTokenMutation]);
}
