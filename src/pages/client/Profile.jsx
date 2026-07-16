import { useEffect, useState } from 'react';
import { HiCamera } from 'react-icons/hi';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useTranslation from '../../hooks/useTranslation';
import { getApiErrorMessage } from '../../services/apiError';
import {
  updatePassword,
  updateProfile,
  uploadProfilePhoto,
} from '../../services/authService';
import useAuthStore from '../../stores/useAuthStore';

const EMPTY_PASSWORD_FORM = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { t } = useTranslation();
  const displayName = user?.full_name ?? user?.name ?? t('profile.defaultName');
  const userInitial = displayName.trim().charAt(0).toUpperCase() || 'P';
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [photoPreview, setPhotoPreview] = useState(user?.profile_image_url ?? '');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setProfileForm({
      full_name: user?.full_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    });
    setPhotoPreview(user?.profile_image_url ?? '');
  }, [user]);

  const updateProfileField = (field) => (event) => {
    setStatusMessage('');
    setErrorMessage('');
    setProfileForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updatePasswordField = (field) => (event) => {
    setStatusMessage('');
    setErrorMessage('');
    setPasswordForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const updatedUser = await updateProfile({
        full_name: profileForm.full_name,
        email: profileForm.email,
        phone: profileForm.phone || undefined,
      });
      setUser(updatedUser);
      setStatusMessage(t('profile.success'));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('profile.error')));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePhotoChange = async (event) => {
    const [file] = event.target.files ?? [];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setIsUploadingPhoto(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const updatedUser = await uploadProfilePhoto(file);
      setUser(updatedUser);
      setPhotoPreview(updatedUser.profile_image_url ?? '');
      setStatusMessage(t('profile.photoSuccess'));
    } catch (error) {
      setPhotoPreview(user?.profile_image_url ?? '');
      setErrorMessage(getApiErrorMessage(error, t('profile.error')));
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorMessage(t('profile.passwordMismatch'));
      return;
    }

    setIsSavingPassword(true);
    try {
      await updatePassword(passwordForm);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setStatusMessage(t('profile.passwordSuccess'));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('profile.error')));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <main className="page-container">
      <p className="page-eyebrow">Animal Health</p>
      <h1 className="page-title">{displayName}</h1>
      <p className="page-subtitle">{t('profile.subtitle')}</p>

      {statusMessage && <p className="status-success">{statusMessage}</p>}
      {errorMessage && <p className="status-error">{errorMessage}</p>}

      <section className="profile-edit-card">
        <div className="profile-photo-panel">
          <div className="profile-photo-preview">
            {photoPreview ? (
              <img src={photoPreview} alt={t('profile.photoAlt')} />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
          <label className="profile-photo-button" htmlFor="profile-photo">
            <HiCamera aria-hidden="true" />
            {isUploadingPhoto ? t('profile.uploadPhoto') : t('profile.uploadPhoto')}
          </label>
          <input
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handlePhotoChange}
            disabled={isUploadingPhoto}
          />
        </div>

        <form className="profile-edit-form" onSubmit={handleProfileSubmit}>
          <h2>{t('profile.personalInfo')}</h2>
          <Input
            id="profile-full-name"
            label={t('profile.fullName')}
            required
            minLength={3}
            maxLength={120}
            value={profileForm.full_name}
            onChange={updateProfileField('full_name')}
          />
          <Input
            id="profile-email"
            label={t('profile.email')}
            required
            type="email"
            value={profileForm.email}
            onChange={updateProfileField('email')}
          />
          <Input
            id="profile-phone"
            label={t('profile.phone')}
            minLength={8}
            maxLength={20}
            placeholder={t('profile.phonePlaceholder')}
            value={profileForm.phone}
            onChange={updateProfileField('phone')}
          />
          <Button type="submit" size="lg" isLoading={isSavingProfile}>
            {t('profile.saveChanges')}
          </Button>
        </form>
      </section>

      <section className="profile-edit-card profile-password-card">
        <form className="profile-edit-form" onSubmit={handlePasswordSubmit}>
          <h2>{t('profile.changePassword')}</h2>
          <p className="profile-form-help">{t('profile.passwordHelp')}</p>
          <Input
            id="profile-current-password"
            label={t('profile.currentPassword')}
            required
            type="password"
            value={passwordForm.current_password}
            onChange={updatePasswordField('current_password')}
          />
          <Input
            id="profile-new-password"
            label={t('profile.newPassword')}
            required
            type="password"
            minLength={8}
            value={passwordForm.new_password}
            onChange={updatePasswordField('new_password')}
          />
          <Input
            id="profile-confirm-password"
            label={t('profile.confirmPassword')}
            required
            type="password"
            minLength={8}
            value={passwordForm.confirm_password}
            onChange={updatePasswordField('confirm_password')}
          />
          <Button type="submit" size="lg" isLoading={isSavingPassword}>
            {t('profile.updatePassword')}
          </Button>
        </form>
      </section>
    </main>
  );
}
