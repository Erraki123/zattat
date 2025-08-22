import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  BookOpen, 
  Users, 
  CreditCard, 
  BarChart3, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

const handleLogin = async () => {
  if (!email || !motDePasse) {
    setMessage('error|Veuillez remplir tous les champs');
    return;
  }

  setIsLoading(true);
  setMessage('');

  try {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, motDePasse })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      setMessage('success|Connexion réussie ! Redirection en cours...');

      setTimeout(() => {
        if (data.role === 'admin') {
          window.location.href = '/admin';
        } else if (data.role === 'prof') {
          window.location.href = '/professeur';
        } else if (data.role === 'etudiant') {
          window.location.href = '/etudiant';
        }else if (data.role === 'paiement_manager') { // Nouveau cas
          window.location.href = '/manager';
        } else {
          setMessage('error|Rôle utilisateur inconnu');
        }
      }, 1500);
    } else {
      setMessage('error|' + (data.message || 'Email ou mot de passe incorrect'));
    }
  } catch (err) {
    console.error('Erreur de connexion:', err);
    setMessage('error|Impossible de se connecter au serveur. Vérifiez votre connexion.');
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const messageType = message.split('|')[0];
  const messageText = message.split('|')[1];

  return (
    <>
      <style>
        {`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

     .login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
  overflow: hidden;
}

        .background-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%);
          animation: float 8s ease-in-out infinite;
        }

 .main-card {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

 @media (max-width: 1024px) {
  .left-panel {
    display: none !important;
  }

  .main-card {
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }

  .right-panel {
    width: 100%;
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

        .left-panel {
          flex: 1;
          background: linear-gradient(to right, #e60039, #8a2be2);
          padding: 60px 40px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .left-panel-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 60%);
        }

        .brand-section {
          position: relative;
          z-index: 1;
          margin-bottom: 50px;
          text-align: center;
        }

        .brand-logo {
          width: 120px;
          height: 120px;
          margin: 0 auto 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .brand-logo img {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }

        .brand-title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .back-button {
          position: absolute;
          top: 30px;
          left: 30px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          z-index: 10;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .right-panel {
          flex: 1;
          padding: 60px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(to right, #e60039, #8a2be2);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 16px;
          color: #6b7280;
        }

        .input-group {
          margin-bottom: 24px;
        }

        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input {
          width: 100%;
          padding: 16px 48px 16px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          background: #f9fafb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          box-sizing: border-box;
        }

        .input:focus {
          border-color: #e60039;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(230, 0, 57, 0.1);
          transform: translateY(-1px);
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          transition: color 0.3s ease;
        }

        .input:focus + .input-icon {
          color: #e60039;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          color: #e60039;
          background: #f3f4f6;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(to right, #e60039, #8a2be2);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(230, 0, 57, 0.4);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .message {
          padding: 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .message-success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .message-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .footer {
          text-align: center;
          margin-top: 32px;
          color: #9ca3af;
          font-size: 14px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        /* Media Queries pour la responsivité */
        @media (max-width: 1024px) {
          .main-card {
            max-width: 900px;
            margin: 10px;
          }
          .left-panel {
            padding: 40px 30px;
          }
          .right-panel {
            padding: 40px 30px;
          }
          .brand-title {
            font-size: 28px;
          }
          .back-button {
            top: 20px;
            left: 20px;
            padding: 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 768px) {
          .login-container {
            padding: 10px;
            align-items: flex-start;
            padding-top: 20px;
          }
          .main-card {
            flex-direction: column;
            max-width: 100%;
            min-height: auto;
            border-radius: 16px;
          }
          .left-panel {
            padding: 30px 20px;
            min-height: 200px;
            text-align: center;
          }
          .brand-section {
            margin-bottom: 30px;
          }
          .brand-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 16px;
          }
          .brand-logo img {
            width: 60px;
            height: 60px;
          }
          .brand-title {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .back-button {
            top: 15px;
            left: 15px;
            padding: 8px;
            font-size: 12px;
          }
          .right-panel {
            padding: 30px 20px;
          }
          .login-header {
            margin-bottom: 30px;
          }
          .login-icon {
            width: 56px;
            height: 56px;
          }
          .login-title {
            font-size: 22px;
          }
          .login-subtitle {
            font-size: 14px;
          }
          .input-group {
            margin-bottom: 20px;
          }
          .input {
            padding: 14px 40px 14px 40px;
            font-size: 16px;
          }
          .footer {
            font-size: 12px;
            margin-top: 20px;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 5px;
          }
          .left-panel {
            padding: 20px 15px;
          }
          .right-panel {
            padding: 20px 15px;
          }
          .brand-title {
            font-size: 20px;
          }
          .back-button {
            top: 10px;
            left: 10px;
            padding: 6px;
            font-size: 11px;
          }
          .login-title {
            font-size: 18px;
          }
          .input {
            padding: 12px 36px 12px 36px;
            font-size: 14px;
          }
          .input-icon {
            left: 12px;
          }
          .password-toggle {
            right: 12px;
          }
          .login-button {
            padding: 14px;
            font-size: 14px;
          }
        }

        @media (max-width: 360px) {
          .brand-logo {
            width: 60px;
            height: 60px;
          }
          .brand-logo img {
            width: 45px;
            height: 45px;
          }
          .login-icon {
            width: 48px;
            height: 48px;
          }
          .input {
            padding: 10px 32px 10px 32px;
          }
        }

        /* Orientation paysage pour tablettes */
        @media (max-width: 1024px) and (orientation: landscape) {
          .left-panel {
            padding: 20px;
          }
          .brand-section {
            margin-bottom: 20px;
          }
        }
      `}</style>
      
      <div className="login-container">
        <div className="background-pattern"></div>
        
        <div className="main-card">
          {/* Panneau gauche - Branding */}
          <div className="left-panel">
            <div className="left-panel-overlay"></div>
            
            <button onClick={handleBackToHome} className="back-button">
              <ArrowLeft size={16} />
              Retour
            </button>
            
            <div className="brand-section">
              <div className="brand-logo">
                <img src="/logo-ak-removebg-preview.png" alt="Alfred Kastler Logo" />
              </div>
              <h1 className="brand-title">Alfred Kastler</h1>
            </div>
          </div>

          {/* Panneau droit - Connexion */}
          <div className="right-panel">
            <div className="login-header">
              <div className="login-icon">
                <User size={32} />
              </div>
              <h2 className="login-title">Connexion Admin</h2>
              <p className="login-subtitle">
                Accédez à votre tableau de bord
              </p>
            </div>

            <div>
              <div className="input-group">
                <label className="label">Adresse Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    placeholder="admin@ecole.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    onKeyPress={handleKeyPress}
                    className="input"
                    required
                  />
                  <Mail size={20} className="input-icon" />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Mot de Passe</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Saisissez votre mot de passe"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    onKeyPress={handleKeyPress}
                    className="input"
                    required
                  />
                  <Lock size={20} className="input-icon" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <User size={20} />
                    Se Connecter
                  </>
                )}
              </button>

              {messageText && (
                <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
                  {messageType === 'success' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  {messageText}
                </div>
              )}
            </div>

            <div className="footer">
              © 2025 ABDO Pro - Tous droits réservés
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;