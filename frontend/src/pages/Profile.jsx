import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';



export default function Profile() {
  const navigate = useNavigate();
  // 👇 Yahan updateUser ko extract kiya
  const { user, isAuthenticated, token, updateUser } = useAuth(); 
  
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleImageChange = (e) => {

  const file = e.target.files[0];


  if(file){

    setAvatarFile(file);


    const previewUrl = URL.createObjectURL(file);


    setAvatarPreview(previewUrl);

  }

};

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('username', username);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile); 
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('Profile updated successfully!'); 
        updateUser(data.data.user);
        setTimeout(() => setSuccessMsg(''), 3000); 
      } else {
        setErrorMsg(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-shell auth-shell">
      <div className="auth-card" style={{ width: '100%', maxWidth: '600px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4 p-2">
          <h2 className='text-center m-0 p-0'>Profile</h2>
          <button 
            className="btn btn-outline-secondary btn-sm" 
            onClick={() => navigate('/chat')}
          >
            <i className="bi bi-arrow-left me-2"></i> Back to Chat
          </button>
        </div>

        <div className="text-center mb-4">
          <div 
            className="auth-brand-icon mx-auto mb-3 position-relative overflow-hidden" 
            style={{ 
              width: '100px', 
              height: '100px', 
              fontSize: '42px', 
              background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, rgba(35, 197, 142, 0.28), rgba(56, 189, 248, 0.16))',
              border: '2px solid rgba(35, 197, 142, 0.5)',
              borderRadius: '50%'
            }}
          >
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <i className="bi bi-person-fill text-primary"></i>
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleImageChange}
          />
          
          <button 
            type="button" 
            className="btn btn-sm btn-outline-light"
            onClick={() => fileInputRef.current.click()}
          >
            <i className="bi bi-camera me-2"></i> 
            {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
          </button>
        </div>

        {successMsg && (
          <div className="alert alert-success py-2 fs-6 border-0" style={{ background: 'rgba(35, 197, 142, 0.15)', color: '#23c58e' }}>
            <i className="bi bi-check-circle-fill me-2"></i> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="alert alert-danger py-2 fs-6 border-0" style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
          </div>
        )}

        <form className="auth-form" onSubmit={handleUpdateProfile}>
          <div className="mb-3">
            <label className="form-label text-secondary small">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small">Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small">Email Address</label>
            <input 
              type="email" 
              className="form-control text-muted" 
              value={email}
              disabled
              title="Email cannot be changed"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2" disabled={isSaving}>
            {isSaving ? (
              <><span className="spinner-border spinner-border-sm me-2" /> Saving...</>
            ) : (
              <><i className="bi bi-save me-2"></i> Save Changes</>
            )}
          </button>
        </form>
        
      </div>
    </div>
  );
}