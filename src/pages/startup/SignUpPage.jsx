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
    const cleanValue = value.replace(/[^\d]/g, ""); // Only allow digits
    updateFormData("mobileNumber", cleanValue);
  };

  const handleNameChange = (field, value) => {
    const cleanValue = value.replace(/[^a-zA-Z\s]/g, ""); // Only allow letters and spaces
    updateFormData(field, cleanValue);
  };

  const parseErrorMessage = (error) => {
    if (error?.data) {
      if (typeof error.data === 'string') {
        if (error.data.includes('Startup already exists with this email')) {
          return 'An account with this email address already exists.';
        }
        if (error.data.includes('Phone number already registered')) {
          return 'An account with this mobile number already exists.';
        }
      }
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
    
    if (error?.message) {
      if (error.message.includes('email')) {
        return 'An account with this email address already exists.';
      }
      if (error.message.includes('phone')) {
        return 'An account with this mobile number already exists.';
      }
      return error.message;
    }

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
        phone: `${countryCode}${formData.mobileNumber}`,
        profile: {
          founderFirstName: formData.founderFirstName,
          founderLastName: formData.founderLastName,
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
      
      setShowSuccessPopup(true);
      
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
                <label htmlFor="mobileNumber">Mobile Number</label>
                <div className="mobile-number-container">
                  <select
                    className="country-code-dropdown"
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    style={{ padding: '12px 8px', lineHeight: '1.5' }}
                  >
                    <option value="+93">AF (+93)</option>
                    <option value="+355">AL (+355)</option>
                    <option value="+213">DZ (+213)</option>
                    <option value="+1-684">AS (+1-684)</option>
                    <option value="+376">AD (+376)</option>
                    <option value="+244">AO (+244)</option>
                    <option value="+1-264">AI (+1-264)</option>
                    <option value="+672">AQ (+672)</option>
                    <option value="+1-268">AG (+1-268)</option>
                    <option value="+54">AR (+54)</option>
                    <option value="+374">AM (+374)</option>
                    <option value="+297">AW (+297)</option>
                    <option value="+61">AU (+61)</option>
                    <option value="+43">AT (+43)</option>
                    <option value="+994">AZ (+994)</option>
                    <option value="+1-242">BS (+1-242)</option>
                    <option value="+973">BH (+973)</option>
                    <option value="+880">BD (+880)</option>
                    <option value="+1-246">BB (+1-246)</option>
                    <option value="+375">BY (+375)</option>
                    <option value="+32">BE (+32)</option>
                    <option value="+501">BZ (+501)</option>
                    <option value="+229">BJ (+229)</option>
                    <option value="+1-441">BM (+1-441)</option>
                    <option value="+975">BT (+975)</option>
                    <option value="+591">BO (+591)</option>
                    <option value="+387">BA (+387)</option>
                    <option value="+267">BW (+267)</option>
                    <option value="+55">BR (+55)</option>
                    <option value="+246">IO (+246)</option>
                    <option value="+1-284">VG (+1-284)</option>
                    <option value="+673">BN (+673)</option>
                    <option value="+359">BG (+359)</option>
                    <option value="+226">BF (+226)</option>
                    <option value="+257">BI (+257)</option>
                    <option value="+855">KH (+855)</option>
                    <option value="+237">CM (+237)</option>
                    <option value="+1">CA (+1)</option>
                    <option value="+238">CV (+238)</option>
                    <option value="+1-345">KY (+1-345)</option>
                    <option value="+236">CF (+236)</option>
                    <option value="+235">TD (+235)</option>
                    <option value="+56">CL (+56)</option>
                    <option value="+86">CN (+86)</option>
                    <option value="+61">CX (+61)</option>
                    <option value="+61">CC (+61)</option>
                    <option value="+57">CO (+57)</option>
                    <option value="+269">KM (+269)</option>
                    <option value="+242">CG (+242)</option>
                    <option value="+243">CD (+243)</option>
                    <option value="+682">CK (+682)</option>
                    <option value="+506">CR (+506)</option>
                    <option value="+385">HR (+385)</option>
                    <option value="+53">CU (+53)</option>
                    <option value="+599">CW (+599)</option>
                    <option value="+357">CY (+357)</option>
                    <option value="+420">CZ (+420)</option>
                    <option value="+45">DK (+45)</option>
                    <option value="+253">DJ (+253)</option>
                    <option value="+1-767">DM (+1-767)</option>
                    <option value="+1-809">DO (+1-809)</option>
                    <option value="+670">TL (+670)</option>
                    <option value="+593">EC (+593)</option>
                    <option value="+20">EG (+20)</option>
                    <option value="+503">SV (+503)</option>
                    <option value="+240">GQ (+240)</option>
                    <option value="+291">ER (+291)</option>
                    <option value="+372">EE (+372)</option>
                    <option value="+251">ET (+251)</option>
                    <option value="+500">FK (+500)</option>
                    <option value="+298">FO (+298)</option>
                    <option value="+679">FJ (+679)</option>
                    <option value="+358">FI (+358)</option>
                    <option value="+33">FR (+33)</option>
                    <option value="+689">PF (+689)</option>
                    <option value="+241">GA (+241)</option>
                    <option value="+220">GM (+220)</option>
                    <option value="+995">GE (+995)</option>
                    <option value="+49">DE (+49)</option>
                    <option value="+233">GH (+233)</option>
                    <option value="+350">GI (+350)</option>
                    <option value="+30">GR (+30)</option>
                    <option value="+299">GL (+299)</option>
                    <option value="+1-473">GD (+1-473)</option>
                    <option value="+1-671">GU (+1-671)</option>
                    <option value="+502">GT (+502)</option>
                    <option value="+44-1481">GG (+44-1481)</option>
                    <option value="+224">GN (+224)</option>
                    <option value="+245">GW (+245)</option>
                    <option value="+592">GY (+592)</option>
                    <option value="+509">HT (+509)</option>
                    <option value="+504">HN (+504)</option>
                    <option value="+852">HK (+852)</option>
                    <option value="+36">HU (+36)</option>
                    <option value="+354">IS (+354)</option>
                    <option value="+91">IN (+91)</option>
                    <option value="+62">ID (+62)</option>
                    <option value="+98">IR (+98)</option>
                    <option value="+964">IQ (+964)</option>
                    <option value="+353">IE (+353)</option>
                    <option value="+44-1624">IM (+44-1624)</option>
                    <option value="+972">IL (+972)</option>
                    <option value="+39">IT (+39)</option>
                    <option value="+225">CI (+225)</option>
                    <option value="+1-876">JM (+1-876)</option>
                    <option value="+81">JP (+81)</option>
                    <option value="+44-1534">JE (+44-1534)</option>
                    <option value="+962">JO (+962)</option>
                    <option value="+7">KZ (+7)</option>
                    <option value="+254">KE (+254)</option>
                    <option value="+686">KI (+686)</option>
                    <option value="+383">XK (+383)</option>
                    <option value="+965">KW (+965)</option>
                    <option value="+996">KG (+996)</option>
                    <option value="+856">LA (+856)</option>
                    <option value="+371">LV (+371)</option>
                    <option value="+961">LB (+961)</option>
                    <option value="+266">LS (+266)</option>
                    <option value="+231">LR (+231)</option>
                    <option value="+218">LY (+218)</option>
                    <option value="+423">LI (+423)</option>
                    <option value="+370">LT (+370)</option>
                    <option value="+352">LU (+352)</option>
                    <option value="+853">MO (+853)</option>
                    <option value="+389">MK (+389)</option>
                    <option value="+261">MG (+261)</option>
                    <option value="+265">MW (+265)</option>
                    <option value="+60">MY (+60)</option>
                    <option value="+960">MV (+960)</option>
                    <option value="+223">ML (+223)</option>
                    <option value="+356">MT (+356)</option>
                    <option value="+692">MH (+692)</option>
                    <option value="+222">MR (+222)</option>
                    <option value="+230">MU (+230)</option>
                    <option value="+262">YT (+262)</option>
                    <option value="+52">MX (+52)</option>
                    <option value="+691">FM (+691)</option>
                    <option value="+373">MD (+373)</option>
                    <option value="+377">MC (+377)</option>
                    <option value="+976">MN (+976)</option>
                    <option value="+382">ME (+382)</option>
                    <option value="+1-664">MS (+1-664)</option>
                    <option value="+212">MA (+212)</option>
                    <option value="+258">MZ (+258)</option>
                    <option value="+95">MM (+95)</option>
                    <option value="+264">NA (+264)</option>
                    <option value="+674">NR (+674)</option>
                    <option value="+977">NP (+977)</option>
                    <option value="+31">NL (+31)</option>
                    <option value="+599">AN (+599)</option>
                    <option value="+687">NC (+687)</option>
                    <option value="+64">NZ (+64)</option>
                    <option value="+505">NI (+505)</option>
                    <option value="+227">NE (+227)</option>
                    <option value="+234">NG (+234)</option>
                    <option value="+683">NU (+683)</option>
                    <option value="+850">KP (+850)</option>
                    <option value="+1-670">MP (+1-670)</option>
                    <option value="+47">NO (+47)</option>
                    <option value="+968">OM (+968)</option>
                    <option value="+92">PK (+92)</option>
                    <option value="+680">PW (+680)</option>
                    <option value="+970">PS (+970)</option>
                    <option value="+507">PA (+507)</option>
                    <option value="+675">PG (+675)</option>
                    <option value="+595">PY (+595)</option>
                    <option value="+51">PE (+51)</option>
                    <option value="+63">PH (+63)</option>
                    <option value="+64">PN (+64)</option>
                    <option value="+48">PL (+48)</option>
                    <option value="+351">PT (+351)</option>
                    <option value="+1-787">PR (+1-787)</option>
                    <option value="+974">QA (+974)</option>
                    <option value="+262">RE (+262)</option>
                    <option value="+40">RO (+40)</option>
                    <option value="+7">RU (+7)</option>
                    <option value="+250">RW (+250)</option>
                    <option value="+590">BL (+590)</option>
                    <option value="+290">SH (+290)</option>
                    <option value="+1-869">KN (+1-869)</option>
                    <option value="+1-758">LC (+1-758)</option>
                    <option value="+590">MF (+590)</option>
                    <option value="+508">PM (+508)</option>
                    <option value="+1-784">VC (+1-784)</option>
                    <option value="+685">WS (+685)</option>
                    <option value="+378">SM (+378)</option>
                    <option value="+239">ST (+239)</option>
                    <option value="+966">SA (+966)</option>
                    <option value="+221">SN (+221)</option>
                    <option value="+381">RS (+381)</option>
                    <option value="+248">SC (+248)</option>
                    <option value="+232">SL (+232)</option>
                    <option value="+65">SG (+65)</option>
                    <option value="+1-721">SX (+1-721)</option>
                    <option value="+421">SK (+421)</option>
                    <option value="+386">SI (+386)</option>
                    <option value="+677">SB (+677)</option>
                    <option value="+252">SO (+252)</option>
                    <option value="+27">ZA (+27)</option>
                    <option value="+82">KR (+82)</option>
                    <option value="+211">SS (+211)</option>
                    <option value="+34">ES (+34)</option>
                    <option value="+94">LK (+94)</option>
                    <option value="+249">SD (+249)</option>
                    <option value="+597">SR (+597)</option>
                    <option value="+47">SJ (+47)</option>
                    <option value="+268">SZ (+268)</option>
                    <option value="+46">SE (+46)</option>
                    <option value="+41">CH (+41)</option>
                    <option value="+963">SY (+963)</option>
                    <option value="+886">TW (+886)</option>
                    <option value="+992">TJ (+992)</option>
                    <option value="+255">TZ (+255)</option>
                    <option value="+66">TH (+66)</option>
                    <option value="+228">TG (+228)</option>
                    <option value="+690">TK (+690)</option>
                    <option value="+676">TO (+676)</option>
                    <option value="+1-868">TT (+1-868)</option>
                    <option value="+216">TN (+216)</option>
                    <option value="+90">TR (+90)</option>
                    <option value="+993">TM (+993)</option>
                    <option value="+1-649">TC (+1-649)</option>
                    <option value="+688">TV (+688)</option>
                    <option value="+256">UG (+256)</option>
                    <option value="+380">UA (+380)</option>
                    <option value="+971">AE (+971)</option>
                    <option value="+44">GB (+44)</option>
                    <option value="+1">US (+1)</option>
                    <option value="+598">UY (+598)</option>
                    <option value="+998">UZ (+998)</option>
                    <option value="+678">VU (+678)</option>
                    <option value="+379">VA (+379)</option>
                    <option value="+58">VE (+58)</option>
                    <option value="+84">VN (+84)</option>
                    <option value="+1-340">VI (+1-340)</option>
                    <option value="+681">WF (+681)</option>
                    <option value="+212">EH (+212)</option>
                    <option value="+967">YE (+967)</option>
                    <option value="+260">ZM (+260)</option>
                    <option value="+263">ZW (+263)</option>
                  </select>
                  <input
                    id="mobileNumber"
                    type="tel"
                    className="mobile-number-input"
                    value={formData.mobileNumber}
                    onChange={(e) => handleMobileNumberChange(e.target.value)}
                    placeholder="Enter your number"
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

            <div className="signup-form-footer">
              <div className="signup-form-footer-left">© Leansprintr by Taotter. All Rights Reserved.</div>
              <div className="signup-form-footer-right">Terms of Services</div>
            </div>
          </div>
        </>
      ) : (
        <div className="signup-split-container">
          <div className="signup-left">
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
                <label htmlFor="mobileNumber">Mobile Number</label>
                <div className="mobile-number-container">
                  <select
                    className="country-code-dropdown"
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    style={{ padding: '12px 8px', lineHeight: '1.5' }}
                  >
                    <option value="+93">AF (+93)</option>
                    <option value="+355">AL (+355)</option>
                    <option value="+213">DZ (+213)</option>
                    <option value="+1-684">AS (+1-684)</option>
                    <option value="+376">AD (+376)</option>
                    <option value="+244">AO (+244)</option>
                    <option value="+1-264">AI (+1-264)</option>
                    <option value="+672">AQ (+672)</option>
                    <option value="+1-268">AG (+1-268)</option>
                    <option value="+54">AR (+54)</option>
                    <option value="+374">AM (+374)</option>
                    <option value="+297">AW (+297)</option>
                    <option value="+61">AU (+61)</option>
                    <option value="+43">AT (+43)</option>
                    <option value="+994">AZ (+994)</option>
                    <option value="+1-242">BS (+1-242)</option>
                    <option value="+973">BH (+973)</option>
                    <option value="+880">BD (+880)</option>
                    <option value="+1-246">BB (+1-246)</option>
                    <option value="+375">BY (+375)</option>
                    <option value="+32">BE (+32)</option>
                    <option value="+501">BZ (+501)</option>
                    <option value="+229">BJ (+229)</option>
                    <option value="+1-441">BM (+1-441)</option>
                    <option value="+975">BT (+975)</option>
                    <option value="+591">BO (+591)</option>
                    <option value="+387">BA (+387)</option>
                    <option value="+267">BW (+267)</option>
                    <option value="+55">BR (+55)</option>
                    <option value="+246">IO (+246)</option>
                    <option value="+1-284">VG (+1-284)</option>
                    <option value="+673">BN (+673)</option>
                    <option value="+359">BG (+359)</option>
                    <option value="+226">BF (+226)</option>
                    <option value="+257">BI (+257)</option>
                    <option value="+855">KH (+855)</option>
                    <option value="+237">CM (+237)</option>
                    <option value="+1">CA (+1)</option>
                    <option value="+238">CV (+238)</option>
                    <option value="+1-345">KY (+1-345)</option>
                    <option value="+236">CF (+236)</option>
                    <option value="+235">TD (+235)</option>
                    <option value="+56">CL (+56)</option>
                    <option value="+86">CN (+86)</option>
                    <option value="+61">CX (+61)</option>
                    <option value="+61">CC (+61)</option>
                    <option value="+57">CO (+57)</option>
                    <option value="+269">KM (+269)</option>
                    <option value="+242">CG (+242)</option>
                    <option value="+243">CD (+243)</option>
                    <option value="+682">CK (+682)</option>
                    <option value="+506">CR (+506)</option>
                    <option value="+385">HR (+385)</option>
                    <option value="+53">CU (+53)</option>
                    <option value="+599">CW (+599)</option>
                    <option value="+357">CY (+357)</option>
                    <option value="+420">CZ (+420)</option>
                    <option value="+45">DK (+45)</option>
                    <option value="+253">DJ (+253)</option>
                    <option value="+1-767">DM (+1-767)</option>
                    <option value="+1-809">DO (+1-809)</option>
                    <option value="+670">TL (+670)</option>
                    <option value="+593">EC (+593)</option>
                    <option value="+20">EG (+20)</option>
                    <option value="+503">SV (+503)</option>
                    <option value="+240">GQ (+240)</option>
                    <option value="+291">ER (+291)</option>
                    <option value="+372">EE (+372)</option>
                    <option value="+251">ET (+251)</option>
                    <option value="+500">FK (+500)</option>
                    <option value="+298">FO (+298)</option>
                    <option value="+679">FJ (+679)</option>
                    <option value="+358">FI (+358)</option>
                    <option value="+33">FR (+33)</option>
                    <option value="+689">PF (+689)</option>
                    <option value="+241">GA (+241)</option>
                    <option value="+220">GM (+220)</option>
                    <option value="+995">GE (+995)</option>
                    <option value="+49">DE (+49)</option>
                    <option value="+233">GH (+233)</option>
                    <option value="+350">GI (+350)</option>
                    <option value="+30">GR (+30)</option>
                    <option value="+299">GL (+299)</option>
                    <option value="+1-473">GD (+1-473)</option>
                    <option value="+1-671">GU (+1-671)</option>
                    <option value="+502">GT (+502)</option>
                    <option value="+44-1481">GG (+44-1481)</option>
                    <option value="+224">GN (+224)</option>
                    <option value="+245">GW (+245)</option>
                    <option value="+592">GY (+592)</option>
                    <option value="+509">HT (+509)</option>
                    <option value="+504">HN (+504)</option>
                    <option value="+852">HK (+852)</option>
                    <option value="+36">HU (+36)</option>
                    <option value="+354">IS (+354)</option>
                    <option value="+91">IN (+91)</option>
                    <option value="+62">ID (+62)</option>
                    <option value="+98">IR (+98)</option>
                    <option value="+964">IQ (+964)</option>
                    <option value="+353">IE (+353)</option>
                    <option value="+44-1624">IM (+44-1624)</option>
                    <option value="+972">IL (+972)</option>
                    <option value="+39">IT (+39)</option>
                    <option value="+225">CI (+225)</option>
                    <option value="+1-876">JM (+1-876)</option>
                    <option value="+81">JP (+81)</option>
                    <option value="+44-1534">JE (+44-1534)</option>
                    <option value="+962">JO (+962)</option>
                    <option value="+7">KZ (+7)</option>
                    <option value="+254">KE (+254)</option>
                    <option value="+686">KI (+686)</option>
                    <option value="+383">XK (+383)</option>
                    <option value="+965">KW (+965)</option>
                    <option value="+996">KG (+996)</option>
                    <option value="+856">LA (+856)</option>
                    <option value="+371">LV (+371)</option>
                    <option value="+961">LB (+961)</option>
                    <option value="+266">LS (+266)</option>
                    <option value="+231">LR (+231)</option>
                    <option value="+218">LY (+218)</option>
                    <option value="+423">LI (+423)</option>
                    <option value="+370">LT (+370)</option>
                    <option value="+352">LU (+352)</option>
                    <option value="+853">MO (+853)</option>
                    <option value="+389">MK (+389)</option>
                    <option value="+261">MG (+261)</option>
                    <option value="+265">MW (+265)</option>
                    <option value="+60">MY (+60)</option>
                    <option value="+960">MV (+960)</option>
                    <option value="+223">ML (+223)</option>
                    <option value="+356">MT (+356)</option>
                    <option value="+692">MH (+692)</option>
                    <option value="+222">MR (+222)</option>
                    <option value="+230">MU (+230)</option>
                    <option value="+262">YT (+262)</option>
                    <option value="+52">MX (+52)</option>
                    <option value="+691">FM (+691)</option>
                    <option value="+373">MD (+373)</option>
                    <option value="+377">MC (+377)</option>
                    <option value="+976">MN (+976)</option>
                    <option value="+382">ME (+382)</option>
                    <option value="+1-664">MS (+1-664)</option>
                    <option value="+212">MA (+212)</option>
                    <option value="+258">MZ (+258)</option>
                    <option value="+95">MM (+95)</option>
                    <option value="+264">NA (+264)</option>
                    <option value="+674">NR (+674)</option>
                    <option value="+977">NP (+977)</option>
                    <option value="+31">NL (+31)</option>
                    <option value="+599">AN (+599)</option>
                    <option value="+687">NC (+687)</option>
                    <option value="+64">NZ (+64)</option>
                    <option value="+505">NI (+505)</option>
                    <option value="+227">NE (+227)</option>
                    <option value="+234">NG (+234)</option>
                    <option value="+683">NU (+683)</option>
                    <option value="+850">KP (+850)</option>
                    <option value="+1-670">MP (+1-670)</option>
                    <option value="+47">NO (+47)</option>
                    <option value="+968">OM (+968)</option>
                    <option value="+92">PK (+92)</option>
                    <option value="+680">PW (+680)</option>
                    <option value="+970">PS (+970)</option>
                    <option value="+507">PA (+507)</option>
                    <option value="+675">PG (+675)</option>
                    <option value="+595">PY (+595)</option>
                    <option value="+51">PE (+51)</option>
                    <option value="+63">PH (+63)</option>
                    <option value="+64">PN (+64)</option>
                    <option value="+48">PL (+48)</option>
                    <option value="+351">PT (+351)</option>
                    <option value="+1-787">PR (+1-787)</option>
                    <option value="+974">QA (+974)</option>
                    <option value="+262">RE (+262)</option>
                    <option value="+40">RO (+40)</option>
                    <option value="+7">RU (+7)</option>
                    <option value="+250">RW (+250)</option>
                    <option value="+590">BL (+590)</option>
                    <option value="+290">SH (+290)</option>
                    <option value="+1-869">KN (+1-869)</option>
                    <option value="+1-758">LC (+1-758)</option>
                    <option value="+590">MF (+590)</option>
                    <option value="+508">PM (+508)</option>
                    <option value="+1-784">VC (+1-784)</option>
                    <option value="+685">WS (+685)</option>
                    <option value="+378">SM (+378)</option>
                    <option value="+239">ST (+239)</option>
                    <option value="+966">SA (+966)</option>
                    <option value="+221">SN (+221)</option>
                    <option value="+381">RS (+381)</option>
                    <option value="+248">SC (+248)</option>
                    <option value="+232">SL (+232)</option>
                    <option value="+65">SG (+65)</option>
                    <option value="+1-721">SX (+1-721)</option>
                    <option value="+421">SK (+421)</option>
                    <option value="+386">SI (+386)</option>
                    <option value="+677">SB (+677)</option>
                    <option value="+252">SO (+252)</option>
                    <option value="+27">ZA (+27)</option>
                    <option value="+82">KR (+82)</option>
                    <option value="+211">SS (+211)</option>
                    <option value="+34">ES (+34)</option>
                    <option value="+94">LK (+94)</option>
                    <option value="+249">SD (+249)</option>
                    <option value="+597">SR (+597)</option>
                    <option value="+47">SJ (+47)</option>
                    <option value="+268">SZ (+268)</option>
                    <option value="+46">SE (+46)</option>
                    <option value="+41">CH (+41)</option>
                    <option value="+963">SY (+963)</option>
                    <option value="+886">TW (+886)</option>
                    <option value="+992">TJ (+992)</option>
                    <option value="+255">TZ (+255)</option>
                    <option value="+66">TH (+66)</option>
                    <option value="+228">TG (+228)</option>
                    <option value="+690">TK (+690)</option>
                    <option value="+676">TO (+676)</option>
                    <option value="+1-868">TT (+1-868)</option>
                    <option value="+216">TN (+216)</option>
                    <option value="+90">TR (+90)</option>
                    <option value="+993">TM (+993)</option>
                    <option value="+1-649">TC (+1-649)</option>
                    <option value="+688">TV (+688)</option>
                    <option value="+256">UG (+256)</option>
                    <option value="+380">UA (+380)</option>
                    <option value="+971">AE (+971)</option>
                    <option value="+44">GB (+44)</option>
                    <option value="+1">US (+1)</option>
                    <option value="+598">UY (+598)</option>
                    <option value="+998">UZ (+998)</option>
                    <option value="+678">VU (+678)</option>
                    <option value="+379">VA (+379)</option>
                    <option value="+58">VE (+58)</option>
                    <option value="+84">VN (+84)</option>
                    <option value="+1-340">VI (+1-340)</option>
                    <option value="+681">WF (+681)</option>
                    <option value="+212">EH (+212)</option>
                    <option value="+967">YE (+967)</option>
                    <option value="+260">ZM (+260)</option>
                    <option value="+263">ZW (+263)</option>
                  </select>
                  <input
                    id="mobileNumber"
                    type="tel"
                    className="mobile-number-input"
                    value={formData.mobileNumber}
                    onChange={(e) => handleMobileNumberChange(e.target.value)}
                    placeholder="Enter your number"
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
