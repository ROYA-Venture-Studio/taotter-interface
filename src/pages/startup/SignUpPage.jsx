import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui";
import signupImage from "../../assets/images/form.png";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import "./SignUpPage.css";
import { useStartupRegisterMutation } from "../../store/api/authApi";
import { useLinkQuestionnaireMutation } from "../../store/api/questionnairesApi";
import { useAppDispatch } from "../../store/hooks";
import { loginSuccess } from "../../store/slices/authSlice";

// Mobile detection hook
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= breakpoint);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

const SignUpPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [startupRegister] = useStartupRegisterMutation();
  const [linkQuestionnaire] = useLinkQuestionnaireMutation();

  const [formData, setFormData] = useState({
    email: "",
    founderFirstName: "",
    founderLastName: "",
    companyName: "",
    mobileNumber: "",
    password: "",
    agreeToTerms: false,
  });
  const [countryCode, setCountryCode] = useState("+1");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.founderFirstName.trim()) {
      newErrors.founderFirstName = "First name is required";
    }
    if (!formData.founderLastName.trim()) {
      newErrors.founderLastName = "Last name is required";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{8,15}$/.test(formData.mobileNumber.replace(/\s+/g, ""))) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the Terms and Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCountryCodeChange = (code) => {
    setCountryCode(code);
  };

  const handleMobileNumberChange = (value) => {
    const cleanValue = value
      .replace(new RegExp(`^\\${countryCode}`), "")
      .trim();
    updateFormData("mobileNumber", cleanValue);
  };

  const handleNameChange = (field, value) => {
    // Only allow letters and spaces
    const cleanValue = value.replace(/[^a-zA-Z\s]/g, '');
    updateFormData(field, cleanValue);
  };

  const parseErrorMessage = (error) => {
    // Handle RTK Query error structure
    if (error?.data) {
      // If error.data is a string (HTML), try to extract the error message
      if (typeof error.data === 'string') {
        // Look for error messages in HTML response
        if (error.data.includes('Startup already exists with this email')) {
          return 'An account with this email address already exists.';
        }
        if (error.data.includes('Phone number already registered')) {
          return 'An account with this mobile number already exists.';
        }
      }
      // If error.data is an object with a message
      if (error.data.message) {
        if (error.data.message.includes('email')) {
          return 'An account with this email address already exists.';
        }
        if (error.data.message.includes('phone')) {
          return 'An account with this mobile number already exists.';
        }
        return error.data.message;
      }
    }
    
    // Handle error.message
    if (error?.message) {
      if (error.message.includes('email')) {
        return 'An account with this email address already exists.';
      }
      if (error.message.includes('phone')) {
        return 'An account with this mobile number already exists.';
      }
      return error.message;
    }

    // Default fallback
    return 'Signup failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        phone: formData.mobileNumber,
        profile: {
          founderFirstName: formData.founderFirstName,
          founderLastName: formData.founderLastName,
          companyName: formData.companyName,
        },
      };
      const response = await startupRegister(registerData).unwrap();
      if (
        response &&
        response.data &&
        response.data.tokens &&
        response.data.startup
      ) {
        dispatch(
          loginSuccess({
            user: response.data.startup,
            token: response.data.tokens.accessToken,
            refreshToken: response.data.tokens.refreshToken,
            userType: "startup",
            permissions: [],
          })
        );
      }
      const tempId = localStorage.getItem("taotter-mvp-temporary-id");
      if (tempId) {
        try {
          await linkQuestionnaire(tempId).unwrap();
          localStorage.removeItem("taotter-mvp-temporary-id");
        } catch (linkErr) {
          console.error("Questionnaire linking failed:", linkErr);
        }
      }
      
      // Show success popup
      setShowSuccessPopup(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/startup/login");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = parseErrorMessage(error);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-popup-content">
              <div className="success-icon">✓</div>
              <h3>Account Created Successfully!</h3>
              <p>Welcome to Leansprintr! You'll be redirected to the login page shortly.</p>
            </div>
          </div>
        </div>
      )}
      
      {isMobile ? (
        <>
          <div className="signup-mobile-header">
            <img
              src={leanSprintLogo}
              alt="LeanSprint Logo"
              className="signup-mobile-logo"
            />
            <button 
              className="signup-mobile-back-btn"
              onClick={() => navigate("/")}
            >
              Back to home
            </button>
          </div>
          <div className="signup-mobile-container">
            <div className="signup-mobile-title">Create Your Account</div>
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>
              <div className="signup-form-row">
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderFirstName">First Name</label>
                    <input
                      id="founderFirstName"
                      type="text"
                      value={formData.founderFirstName}
                      onChange={(e) =>
                        handleNameChange("founderFirstName", e.target.value)
                      }
                      placeholder="Enter your first name"
                      required
                    />
                    {errors.founderFirstName && (
                      <div className="error-message">
                        {errors.founderFirstName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderLastName">Last Name</label>
                    <input
                      id="founderLastName"
                      type="text"
                      value={formData.founderLastName}
                      onChange={(e) =>
                        handleNameChange("founderLastName", e.target.value)
                      }
                      placeholder="Enter your last name"
                      required
                    />
                    {errors.founderLastName && (
                      <div className="error-message">
                        {errors.founderLastName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="signup-form-field">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    updateFormData("companyName", e.target.value)
                  }
                  placeholder="Enter your company name"
                  required
                />
                {errors.companyName && (
                  <div className="error-message">{errors.companyName}</div>
                )}
              </div>
              <div className="signup-form-field">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <div className="mobile-number-container">
                  <select
                    className="country-code-dropdown"
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    style={{ padding: '12px 8px', lineHeight: '1.5' }}
                  >
                    <option value="+93">+93 AF</option>
                    <option value="+355">+355 AL</option>
                    <option value="+213">+213 DZ</option>
                    <option value="+1-684">+1-684 AS</option>
                    <option value="+376">+376 AD</option>
                    <option value="+244">+244 AO</option>
                    <option value="+1-264">+1-264 AI</option>
                    <option value="+672">+672 AQ</option>
                    <option value="+1-268">+1-268 AG</option>
                    <option value="+54">+54 AR</option>
                    <option value="+374">+374 AM</option>
                    <option value="+297">+297 AW</option>
                    <option value="+61">+61 AU</option>
                    <option value="+43">+43 AT</option>
                    <option value="+994">+994 AZ</option>
                    <option value="+1-242">+1-242 BS</option>
                    <option value="+973">+973 BH</option>
                    <option value="+880">+880 BD</option>
                    <option value="+1-246">+1-246 BB</option>
                    <option value="+375">+375 BY</option>
                    <option value="+32">+32 BE</option>
                    <option value="+501">+501 BZ</option>
                    <option value="+229">+229 BJ</option>
                    <option value="+1-441">+1-441 BM</option>
                    <option value="+975">+975 BT</option>
                    <option value="+591">+591 BO</option>
                    <option value="+387">+387 BA</option>
                    <option value="+267">+267 BW</option>
                    <option value="+55">+55 BR</option>
                    <option value="+246">+246 IO</option>
                    <option value="+1-284">+1-284 VG</option>
                    <option value="+673">+673 BN</option>
                    <option value="+359">+359 BG</option>
                    <option value="+226">+226 BF</option>
                    <option value="+257">+257 BI</option>
                    <option value="+855">+855 KH</option>
                    <option value="+237">+237 CM</option>
                    <option value="+1">+1 CA</option>
                    <option value="+238">+238 CV</option>
                    <option value="+1-345">+1-345 KY</option>
                    <option value="+236">+236 CF</option>
                    <option value="+235">+235 TD</option>
                    <option value="+56">+56 CL</option>
                    <option value="+86">+86 CN</option>
                    <option value="+61">+61 CX</option>
                    <option value="+61">+61 CC</option>
                    <option value="+57">+57 CO</option>
                    <option value="+269">+269 KM</option>
                    <option value="+242">+242 CG</option>
                    <option value="+243">+243 CD</option>
                    <option value="+682">+682 CK</option>
                    <option value="+506">+506 CR</option>
                    <option value="+385">+385 HR</option>
                    <option value="+53">+53 CU</option>
                    <option value="+599">+599 CW</option>
                    <option value="+357">+357 CY</option>
                    <option value="+420">+420 CZ</option>
                    <option value="+45">+45 DK</option>
                    <option value="+253">+253 DJ</option>
                    <option value="+1-767">+1-767 DM</option>
                    <option value="+1-809">+1-809 DO</option>
                    <option value="+670">+670 TL</option>
                    <option value="+593">+593 EC</option>
                    <option value="+20">+20 EG</option>
                    <option value="+503">+503 SV</option>
                    <option value="+240">+240 GQ</option>
                    <option value="+291">+291 ER</option>
                    <option value="+372">+372 EE</option>
                    <option value="+251">+251 ET</option>
                    <option value="+500">+500 FK</option>
                    <option value="+298">+298 FO</option>
                    <option value="+679">+679 FJ</option>
                    <option value="+358">+358 FI</option>
                    <option value="+33">+33 FR</option>
                    <option value="+689">+689 PF</option>
                    <option value="+241">+241 GA</option>
                    <option value="+220">+220 GM</option>
                    <option value="+995">+995 GE</option>
                    <option value="+49">+49 DE</option>
                    <option value="+233">+233 GH</option>
                    <option value="+350">+350 GI</option>
                    <option value="+30">+30 GR</option>
                    <option value="+299">+299 GL</option>
                    <option value="+1-473">+1-473 GD</option>
                    <option value="+1-671">+1-671 GU</option>
                    <option value="+502">+502 GT</option>
                    <option value="+44-1481">+44-1481 GG</option>
                    <option value="+224">+224 GN</option>
                    <option value="+245">+245 GW</option>
                    <option value="+592">+592 GY</option>
                    <option value="+509">+509 HT</option>
                    <option value="+504">+504 HN</option>
                    <option value="+852">+852 HK</option>
                    <option value="+36">+36 HU</option>
                    <option value="+354">+354 IS</option>
                    <option value="+91">+91 IN</option>
                    <option value="+62">+62 ID</option>
                    <option value="+98">+98 IR</option>
                    <option value="+964">+964 IQ</option>
                    <option value="+353">+353 IE</option>
                    <option value="+44-1624">+44-1624 IM</option>
                    <option value="+972">+972 IL</option>
                    <option value="+39">+39 IT</option>
                    <option value="+225">+225 CI</option>
                    <option value="+1-876">+1-876 JM</option>
                    <option value="+81">+81 JP</option>
                    <option value="+44-1534">+44-1534 JE</option>
                    <option value="+962">+962 JO</option>
                    <option value="+7">+7 KZ</option>
                    <option value="+254">+254 KE</option>
                    <option value="+686">+686 KI</option>
                    <option value="+383">+383 XK</option>
                    <option value="+965">+965 KW</option>
                    <option value="+996">+996 KG</option>
                    <option value="+856">+856 LA</option>
                    <option value="+371">+371 LV</option>
                    <option value="+961">+961 LB</option>
                    <option value="+266">+266 LS</option>
                    <option value="+231">+231 LR</option>
                    <option value="+218">+218 LY</option>
                    <option value="+423">+423 LI</option>
                    <option value="+370">+370 LT</option>
                    <option value="+352">+352 LU</option>
                    <option value="+853">+853 MO</option>
                    <option value="+389">+389 MK</option>
                    <option value="+261">+261 MG</option>
                    <option value="+265">+265 MW</option>
                    <option value="+60">+60 MY</option>
                    <option value="+960">+960 MV</option>
                    <option value="+223">+223 ML</option>
                    <option value="+356">+356 MT</option>
                    <option value="+692">+692 MH</option>
                    <option value="+222">+222 MR</option>
                    <option value="+230">+230 MU</option>
                    <option value="+262">+262 YT</option>
                    <option value="+52">+52 MX</option>
                    <option value="+691">+691 FM</option>
                    <option value="+373">+373 MD</option>
                    <option value="+377">+377 MC</option>
                    <option value="+976">+976 MN</option>
                    <option value="+382">+382 ME</option>
                    <option value="+1-664">+1-664 MS</option>
                    <option value="+212">+212 MA</option>
                    <option value="+258">+258 MZ</option>
                    <option value="+95">+95 MM</option>
                    <option value="+264">+264 NA</option>
                    <option value="+674">+674 NR</option>
                    <option value="+977">+977 NP</option>
                    <option value="+31">+31 NL</option>
                    <option value="+599">+599 AN</option>
                    <option value="+687">+687 NC</option>
                    <option value="+64">+64 NZ</option>
                    <option value="+505">+505 NI</option>
                    <option value="+227">+227 NE</option>
                    <option value="+234">+234 NG</option>
                    <option value="+683">+683 NU</option>
                    <option value="+850">+850 KP</option>
                    <option value="+1-670">+1-670 MP</option>
                    <option value="+47">+47 NO</option>
                    <option value="+968">+968 OM</option>
                    <option value="+92">+92 PK</option>
                    <option value="+680">+680 PW</option>
                    <option value="+970">+970 PS</option>
                    <option value="+507">+507 PA</option>
                    <option value="+675">+675 PG</option>
                    <option value="+595">+595 PY</option>
                    <option value="+51">+51 PE</option>
                    <option value="+63">+63 PH</option>
                    <option value="+64">+64 PN</option>
                    <option value="+48">+48 PL</option>
                    <option value="+351">+351 PT</option>
                    <option value="+1-787">+1-787 PR</option>
                    <option value="+974">+974 QA</option>
                    <option value="+262">+262 RE</option>
                    <option value="+40">+40 RO</option>
                    <option value="+7">+7 RU</option>
                    <option value="+250">+250 RW</option>
                    <option value="+590">+590 BL</option>
                    <option value="+290">+290 SH</option>
                    <option value="+1-869">+1-869 KN</option>
                    <option value="+1-758">+1-758 LC</option>
                    <option value="+590">+590 MF</option>
                    <option value="+508">+508 PM</option>
                    <option value="+1-784">+1-784 VC</option>
                    <option value="+685">+685 WS</option>
                    <option value="+378">+378 SM</option>
                    <option value="+239">+239 ST</option>
                    <option value="+966">+966 SA</option>
                    <option value="+221">+221 SN</option>
                    <option value="+381">+381 RS</option>
                    <option value="+248">+248 SC</option>
                    <option value="+232">+232 SL</option>
                    <option value="+65">+65 SG</option>
                    <option value="+1-721">+1-721 SX</option>
                    <option value="+421">+421 SK</option>
                    <option value="+386">+386 SI</option>
                    <option value="+677">+677 SB</option>
                    <option value="+252">+252 SO</option>
                    <option value="+27">+27 ZA</option>
                    <option value="+82">+82 KR</option>
                    <option value="+211">+211 SS</option>
                    <option value="+34">+34 ES</option>
                    <option value="+94">+94 LK</option>
                    <option value="+249">+249 SD</option>
                    <option value="+597">+597 SR</option>
                    <option value="+47">+47 SJ</option>
                    <option value="+268">+268 SZ</option>
                    <option value="+46">+46 SE</option>
                    <option value="+41">+41 CH</option>
                    <option value="+963">+963 SY</option>
                    <option value="+886">+886 TW</option>
                    <option value="+992">+992 TJ</option>
                    <option value="+255">+255 TZ</option>
                    <option value="+66">+66 TH</option>
                    <option value="+228">+228 TG</option>
                    <option value="+690">+690 TK</option>
                    <option value="+676">+676 TO</option>
                    <option value="+1-868">+1-868 TT</option>
                    <option value="+216">+216 TN</option>
                    <option value="+90">+90 TR</option>
                    <option value="+993">+993 TM</option>
                    <option value="+1-649">+1-649 TC</option>
                    <option value="+688">+688 TV</option>
                    <option value="+256">+256 UG</option>
                    <option value="+380">+380 UA</option>
                    <option value="+971">+971 AE</option>
                    <option value="+44">+44 GB</option>
                    <option value="+1">+1 US</option>
                    <option value="+598">+598 UY</option>
                    <option value="+998">+998 UZ</option>
                    <option value="+678">+678 VU</option>
                    <option value="+379">+379 VA</option>
                    <option value="+58">+58 VE</option>
                    <option value="+84">+84 VN</option>
                    <option value="+1-340">+1-340 VI</option>
                    <option value="+681">+681 WF</option>
                    <option value="+212">+212 EH</option>
                    <option value="+967">+967 YE</option>
                    <option value="+260">+260 ZM</option>
                    <option value="+263">+263 ZW</option>
                  </select>
                  <input
                    id="mobileNumber"
                    type="tel"
                    className="mobile-number-input"
                    value={`${countryCode} ${formData.mobileNumber}`}
                    onChange={(e) => handleMobileNumberChange(e.target.value)}
                    placeholder={`${countryCode} Enter your number`}
                    required
                  />
                </div>
                {errors.mobileNumber && (
                  <div className="error-message">{errors.mobileNumber}</div>
                )}
              </div>
              <div className="signup-form-field">
                <label htmlFor="password">Password</label>
                <div className="password-field-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Icon
                      name={showPassword ? "eye-disabled" : "Eye"}
                      size={20}
                    />
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>
              <div className="terms-checkbox-container">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    id="agreeToTermsMobile"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      updateFormData("agreeToTerms", e.target.checked)
                    }
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: 0,
                      height: 0,
                    }}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="terms-checkbox-label">
                    By signing up, you agree to our{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Terms and Conditions
                    </a>
                    , and our{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
              {errors.agreeToTerms && (
                <div className="error-message">{errors.agreeToTerms}</div>
              )}
              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}
              <button
                type="submit"
                className="signup-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Footer */}
            <div className="signup-form-footer">
              <div className="signup-form-footer-left">© Leansprintr by Taotter. All Rights Reserved.</div>
              <div className="signup-form-footer-right">Terms of Services</div>
            </div>
          </div>
        </>
      ) : (
        <div className="signup-split-container">
          <div className="signup-left">
            {/* Desktop Header */}
            <div className="signup-desktop-header">
              <img
                src={leanSprintLogo}
                alt="LeanSprint Logo"
                className="signup-desktop-logo"
              />
              <button 
                className="signup-desktop-back-btn"
                onClick={() => navigate("/")}
              >
                Back to home
              </button>
            </div>

            <div className="signup-form-title">Create an Account</div>
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>
              <div className="signup-form-row">
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderFirstName">First Name</label>
                    <input
                      id="founderFirstName"
                      type="text"
                      value={formData.founderFirstName}
                      onChange={(e) =>
                        handleNameChange("founderFirstName", e.target.value)
                      }
                      placeholder="Enter your first name"
                      required
                    />
                    {errors.founderFirstName && (
                      <div className="error-message">
                        {errors.founderFirstName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderLastName">Last Name</label>
                    <input
                      id="founderLastName"
                      type="text"
                      value={formData.founderLastName}
                      onChange={(e) =>
                        handleNameChange("founderLastName", e.target.value)
                      }
                      placeholder="Enter your last name"
                      required
                    />
                    {errors.founderLastName && (
                      <div className="error-message">
                        {errors.founderLastName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="signup-form-field">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    updateFormData("companyName", e.target.value)
                  }
                  placeholder="Enter your company name"
                  required
                />
                {errors.companyName && (
                  <div className="error-message">{errors.companyName}</div>
                )}
              </div>
              <div className="signup-form-field">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <div className="mobile-number-container">
                  <select
                    className="country-code-dropdown"
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    style={{ padding: '12px 8px', lineHeight: '1.5' }}
                  >
                    <option value="+93">+93 AF</option>
                    <option value="+355">+355 AL</option>
                    <option value="+213">+213 DZ</option>
                    <option value="+1-684">+1-684 AS</option>
                    <option value="+376">+376 AD</option>
                    <option value="+244">+244 AO</option>
                    <option value="+1-264">+1-264 AI</option>
                    <option value="+672">+672 AQ</option>
                    <option value="+1-268">+1-268 AG</option>
                    <option value="+54">+54 AR</option>
                    <option value="+374">+374 AM</option>
                    <option value="+297">+297 AW</option>
                    <option value="+61">+61 AU</option>
                    <option value="+43">+43 AT</option>
                    <option value="+994">+994 AZ</option>
                    <option value="+1-242">+1-242 BS</option>
                    <option value="+973">+973 BH</option>
                    <option value="+880">+880 BD</option>
                    <option value="+1-246">+1-246 BB</option>
                    <option value="+375">+375 BY</option>
                    <option value="+32">+32 BE</option>
                    <option value="+501">+501 BZ</option>
                    <option value="+229">+229 BJ</option>
                    <option value="+1-441">+1-441 BM</option>
                    <option value="+975">+975 BT</option>
                    <option value="+591">+591 BO</option>
                    <option value="+387">+387 BA</option>
                    <option value="+267">+267 BW</option>
                    <option value="+55">+55 BR</option>
                    <option value="+246">+246 IO</option>
                    <option value="+1-284">+1-284 VG</option>
                    <option value="+673">+673 BN</option>
                    <option value="+359">+359 BG</option>
                    <option value="+226">+226 BF</option>
                    <option value="+257">+257 BI</option>
                    <option value="+855">+855 KH</option>
                    <option value="+237">+237 CM</option>
                    <option value="+1">+1 CA</option>
                    <option value="+238">+238 CV</option>
                    <option value="+1-345">+1-345 KY</option>
                    <option value="+236">+236 CF</option>
                    <option value="+235">+235 TD</option>
                    <option value="+56">+56 CL</option>
                    <option value="+86">+86 CN</option>
                    <option value="+61">+61 CX</option>
                    <option value="+61">+61 CC</option>
                    <option value="+57">+57 CO</option>
                    <option value="+269">+269 KM</option>
                    <option value="+242">+242 CG</option>
                    <option value="+243">+243 CD</option>
                    <option value="+682">+682 CK</option>
                    <option value="+506">+506 CR</option>
                    <option value="+385">+385 HR</option>
                    <option value="+53">+53 CU</option>
                    <option value="+599">+599 CW</option>
                    <option value="+357">+357 CY</option>
                    <option value="+420">+420 CZ</option>
                    <option value="+45">+45 DK</option>
                    <option value="+253">+253 DJ</option>
                    <option value="+1-767">+1-767 DM</option>
                    <option value="+1-809">+1-809 DO</option>
                    <option value="+670">+670 TL</option>
                    <option value="+593">+593 EC</option>
                    <option value="+20">+20 EG</option>
                    <option value="+503">+503 SV</option>
                    <option value="+240">+240 GQ</option>
                    <option value="+291">+291 ER</option>
                    <option value="+372">+372 EE</option>
                    <option value="+251">+251 ET</option>
                    <option value="+500">+500 FK</option>
                    <option value="+298">+298 FO</option>
                    <option value="+679">+679 FJ</option>
                    <option value="+358">+358 FI</option>
                    <option value="+33">+33 FR</option>
                    <option value="+689">+689 PF</option>
                    <option value="+241">+241 GA</option>
                    <option value="+220">+220 GM</option>
                    <option value="+995">+995 GE</option>
                    <option value="+49">+49 DE</option>
                    <option value="+233">+233 GH</option>
                    <option value="+350">+350 GI</option>
                    <option value="+30">+30 GR</option>
                    <option value="+299">+299 GL</option>
                    <option value="+1-473">+1-473 GD</option>
                    <option value="+1-671">+1-671 GU</option>
                    <option value="+502">+502 GT</option>
                    <option value="+44-1481">+44-1481 GG</option>
                    <option value="+224">+224 GN</option>
                    <option value="+245">+245 GW</option>
                    <option value="+592">+592 GY</option>
                    <option value="+509">+509 HT</option>
                    <option value="+504">+504 HN</option>
                    <option value="+852">+852 HK</option>
                    <option value="+36">+36 HU</option>
                    <option value="+354">+354 IS</option>
                    <option value="+91">+91 IN</option>
                    <option value="+62">+62 ID</option>
                    <option value="+98">+98 IR</option>
                    <option value="+964">+964 IQ</option>
                    <option value="+353">+353 IE</option>
                    <option value="+44-1624">+44-1624 IM</option>
                    <option value="+972">+972 IL</option>
                    <option value="+39">+39 IT</option>
                    <option value="+225">+225 CI</option>
                    <option value="+1-876">+1-876 JM</option>
                    <option value="+81">+81 JP</option>
                    <option value="+44-1534">+44-1534 JE</option>
                    <option value="+962">+962 JO</option>
                    <option value="+7">+7 KZ</option>
                    <option value="+254">+254 KE</option>
                    <option value="+686">+686 KI</option>
                    <option value="+383">+383 XK</option>
                    <option value="+965">+965 KW</option>
                    <option value="+996">+996 KG</option>
                    <option value="+856">+856 LA</option>
                    <option value="+371">+371 LV</option>
                    <option value="+961">+961 LB</option>
                    <option value="+266">+266 LS</option>
                    <option value="+231">+231 LR</option>
                    <option value="+218">+218 LY</option>
                    <option value="+423">+423 LI</option>
                    <option value="+370">+370 LT</option>
                    <option value="+352">+352 LU</option>
                    <option value="+853">+853 MO</option>
                    <option value="+389">+389 MK</option>
                    <option value="+261">+261 MG</option>
                    <option value="+265">+265 MW</option>
                    <option value="+60">+60 MY</option>
                    <option value="+960">+960 MV</option>
                    <option value="+223">+223 ML</option>
                    <option value="+356">+356 MT</option>
                    <option value="+692">+692 MH</option>
                    <option value="+222">+222 MR</option>
                    <option value="+230">+230 MU</option>
                    <option value="+262">+262 YT</option>
                    <option value="+52">+52 MX</option>
                    <option value="+691">+691 FM</option>
                    <option value="+373">+373 MD</option>
                    <option value="+377">+377 MC</option>
                    <option value="+976">+976 MN</option>
                    <option value="+382">+382 ME</option>
                    <option value="+1-664">+1-664 MS</option>
                    <option value="+212">+212 MA</option>
                    <option value="+258">+258 MZ</option>
                    <option value="+95">+95 MM</option>
                    <option value="+264">+264 NA</option>
                    <option value="+674">+674 NR</option>
                    <option value="+977">+977 NP</option>
                    <option value="+31">+31 NL</option>
                    <option value="+599">+599 AN</option>
                    <option value="+687">+687 NC</option>
                    <option value="+64">+64 NZ</option>
                    <option value="+505">+505 NI</option>
                    <option value="+227">+227 NE</option>
                    <option value="+234">+234 NG</option>
                    <option value="+683">+683 NU</option>
                    <option value="+850">+850 KP</option>
                    <option value="+1-670">+1-670 MP</option>
                    <option value="+47">+47 NO</option>
                    <option value="+968">+968 OM</option>
                    <option value="+92">+92 PK</option>
                    <option value="+680">+680 PW</option>
                    <option value="+970">+970 PS</option>
                    <option value="+507">+507 PA</option>
                    <option value="+675">+675 PG</option>
                    <option value="+595">+595 PY</option>
                    <option value="+51">+51 PE</option>
                    <option value="+63">+63 PH</option>
                    <option value="+64">+64 PN</option>
                    <option value="+48">+48 PL</option>
                    <option value="+351">+351 PT</option>
                    <option value="+1-787">+1-787 PR</option>
                    <option value="+974">+974 QA</option>
                    <option value="+262">+262 RE</option>
                    <option value="+40">+40 RO</option>
                    <option value="+7">+7 RU</option>
                    <option value="+250">+250 RW</option>
                    <option value="+590">+590 BL</option>
                    <option value="+290">+290 SH</option>
                    <option value="+1-869">+1-869 KN</option>
                    <option value="+1-758">+1-758 LC</option>
                    <option value="+590">+590 MF</option>
                    <option value="+508">+508 PM</option>
                    <option value="+1-784">+1-784 VC</option>
                    <option value="+685">+685 WS</option>
                    <option value="+378">+378 SM</option>
                    <option value="+239">+239 ST</option>
                    <option value="+966">+966 SA</option>
                    <option value="+221">+221 SN</option>
                    <option value="+381">+381 RS</option>
                    <option value="+248">+248 SC</option>
                    <option value="+232">+232 SL</option>
                    <option value="+65">+65 SG</option>
                    <option value="+1-721">+1-721 SX</option>
                    <option value="+421">+421 SK</option>
                    <option value="+386">+386 SI</option>
                    <option value="+677">+677 SB</option>
                    <option value="+252">+252 SO</option>
                    <option value="+27">+27 ZA</option>
                    <option value="+82">+82 KR</option>
                    <option value="+211">+211 SS</option>
                    <option value="+34">+34 ES</option>
                    <option value="+94">+94 LK</option>
                    <option value="+249">+249 SD</option>
                    <option value="+597">+597 SR</option>
                    <option value="+47">+47 SJ</option>
                    <option value="+268">+268 SZ</option>
                    <option value="+46">+46 SE</option>
                    <option value="+41">+41 CH</option>
                    <option value="+963">+963 SY</option>
                    <option value="+886">+886 TW</option>
                    <option value="+992">+992 TJ</option>
                    <option value="+255">+255 TZ</option>
                    <option value="+66">+66 TH</option>
                    <option value="+228">+228 TG</option>
                    <option value="+690">+690 TK</option>
                    <option value="+676">+676 TO</option>
                    <option value="+1-868">+1-868 TT</option>
                    <option value="+216">+216 TN</option>
                    <option value="+90">+90 TR</option>
                    <option value="+993">+993 TM</option>
                    <option value="+1-649">+1-649 TC</option>
                    <option value="+688">+688 TV</option>
                    <option value="+256">+256 UG</option>
                    <option value="+380">+380 UA</option>
                    <option value="+971">+971 AE</option>
                    <option value="+44">+44 GB</option>
                    <option value="+1">+1 US</option>
                    <option value="+598">+598 UY</option>
                    <option value="+998">+998 UZ</option>
                    <option value="+678">+678 VU</option>
                    <option value="+379">+379 VA</option>
                    <option value="+58">+58 VE</option>
                    <option value="+84">+84 VN</option>
                    <option value="+1-340">+1-340 VI</option>
                    <option value="+681">+681 WF</option>
                    <option value="+212">+212 EH</option>
                    <option value="+967">+967 YE</option>
                    <option value="+260">+260 ZM</option>
                    <option value="+263">+263 ZW</option>
                  </select>
                  <input
                    id="mobileNumber"
                    type="tel"
                    className="mobile-number-input"
                    value={`${countryCode} ${formData.mobileNumber}`}
                    onChange={(e) => handleMobileNumberChange(e.target.value)}
                    placeholder={`${countryCode} Enter your number`}
                    required
                  />
                </div>
                {errors.mobileNumber && (
                  <div className="error-message">{errors.mobileNumber}</div>
                )}
              </div>
              <div className="signup-form-field">
                <label htmlFor="password">Password</label>
                <div className="password-field-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Icon
                      name={showPassword ? "eye-disabled" : "Eye"}
                      size={20}
                    />
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>
              <div className="terms-checkbox-container">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      updateFormData("agreeToTerms", e.target.checked)
                    }
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: 0,
                      height: 0,
                    }}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="terms-checkbox-label">
                    By signing up, you agree to our{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Terms and Conditions
                    </a>
                    , and our{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
              {errors.agreeToTerms && (
                <div className="error-message">{errors.agreeToTerms}</div>
              )}
              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}
              <button
                type="submit"
                className="signup-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Footer */}
            <div className="signup-form-footer">
              <div className="signup-form-footer-left">© Leansprintr by Taotter. All Rights Reserved.</div>
              <div className="signup-form-footer-right">Terms of Services</div>
            </div>
          </div>
          <div className="signup-right">
            <img
              src={signupImage}
              alt="Sign Up Visual"
              className="signup-image"
            />
            <div className="signup-image-overlay">
              <h2>From Idea to Customers</h2>
              <p>
                Turn your startup idea into real traction with step-by-step
                guided sprints.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
