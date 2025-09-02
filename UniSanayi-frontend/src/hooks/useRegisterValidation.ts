import { useState } from 'react';
import type { StudentRegisterForm, CompanyRegisterForm } from '../services/authService';

interface ValidationErrors {
  [key: string]: string;
}

export const useRegisterValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateStudentForm = (form: StudentRegisterForm): boolean => {
    const newErrors: ValidationErrors = {};

    // Required fields
    if (!form.firstName.trim()) {
      newErrors.firstName = 'Ad zorunludur';
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = 'Ad en az 2 karakter olmalıdır';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Soyad zorunludur';
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = 'Soyad en az 2 karakter olmalıdır';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }

    if (!form.password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (form.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
    }

    if (!form.universityName.trim()) {
      newErrors.universityName = 'Üniversite adı zorunludur';
    } else if (form.universityName.trim().length < 5) {
      newErrors.universityName = 'Üniversite adı en az 5 karakter olmalıdır';
    }

    if (!form.department.trim()) {
      newErrors.department = 'Bölüm zorunludur';
    } else if (form.department.trim().length < 3) {
      newErrors.department = 'Bölüm adı en az 3 karakter olmalıdır';
    }

    if (!form.currentYear || form.currentYear < 1 || form.currentYear > 6) {
      newErrors.currentYear = 'Geçerli bir sınıf seçiniz (1-6)';
    }

    if (!form.graduationYear) {
      newErrors.graduationYear = 'Mezuniyet yılı zorunludur';
    } else if (form.graduationYear < new Date().getFullYear()) {
      newErrors.graduationYear = 'Mezuniyet yılı geçmiş bir yıl olamaz';
    } else if (form.graduationYear > new Date().getFullYear() + 10) {
      newErrors.graduationYear = 'Mezuniyet yılı çok uzak bir gelecek olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCompanyForm = (form: CompanyRegisterForm): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }

    if (!form.password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (form.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
    }

    if (!form.companyName.trim()) {
      newErrors.companyName = 'Şirket adı zorunludur';
    } else if (form.companyName.trim().length < 2) {
      newErrors.companyName = 'Şirket adı en az 2 karakter olmalıdır';
    }

    if (!form.contactPerson.trim()) {
      newErrors.contactPerson = 'İletişim kişisi zorunludur';
    } else if (form.contactPerson.trim().length < 2) {
      newErrors.contactPerson = 'İletişim kişisi en az 2 karakter olmalıdır';
    }

    // Optional field validations
    if (form.website && form.website.trim() && !form.website.startsWith('http')) {
      newErrors.website = 'Website http:// veya https:// ile başlamalıdır';
    }

    if (form.contactPhone && form.contactPhone.trim() && !/^(\+90|0)?[1-9]\d{9}$/.test(form.contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Geçerli bir telefon numarası giriniz';
    }

    if (form.contactEmail && form.contactEmail.trim() && !/\S+@\S+\.\S+/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Geçerli bir email adresi giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const setGeneralError = (message: string) => {
    setErrors({ general: message });
  };

  return {
    errors,
    validateStudentForm,
    validateCompanyForm,
    clearErrors,
    clearFieldError,
    setGeneralError
  };
};