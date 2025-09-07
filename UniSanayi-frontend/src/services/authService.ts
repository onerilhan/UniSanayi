import apiClient from './apiService';

export type StudentRegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  universityName: string;
  department: string;
  currentYear: number;
  graduationYear: number;
};

export type CompanyRegisterForm = {
  email: string;
  password: string;
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  locationCity: string;
};

export const authService = {
  async registerStudent(form: StudentRegisterForm) {
    // /api/Auth/register/student
    const payload = {
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      universityName: form.universityName,
      department: form.department,
      currentYear: Number(form.currentYear ?? 0),
      graduationYear: Number(form.graduationYear ?? 0),
    };
    const { data } = await apiClient.post('/auth/register/student', payload);
    return data;
  },

  async registerCompany(form: CompanyRegisterForm) {
    //  /api/Auth/register/company
    const payload = {
      email: form.email,
      password: form.password,
      companyName: form.companyName,
      industry: form.industry,
      companySize: form.companySize,
      website: form.website,
      description: form.description,
      contactPerson: form.contactPerson,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      locationCity: form.locationCity,
    };
    const { data } = await apiClient.post('/auth/register/company', payload);
    return data;
  },

  async login(body: { email: string; password: string; captchaToken?: string }) {
  const { data } = await apiClient.post('/auth/login', {
    email: body.email,
    password: body.password,
    captchaToken: body.captchaToken
  });
  return data; 
},
};
