-- 1. Users Table (Ana kullanıcı tablosu)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'company', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);

-- 2. Students Table (Öğrenci detayları)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_number VARCHAR(50),
    university_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    current_year INTEGER CHECK (current_year BETWEEN 1 AND 6),
    graduation_year INTEGER,
    gpa DECIMAL(3,2) CHECK (gpa BETWEEN 0.00 AND 4.00),
    phone VARCHAR(20),
    location_city VARCHAR(100),
    bio TEXT,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_university ON students(university_name);
CREATE INDEX idx_students_department ON students(department);

-- 3. Companies Table (Şirket detayları)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
    website VARCHAR(255),
    description TEXT,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    location_city VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_city ON companies(location_city);

-- 4. Skills Table (Yetenek kataloğu)
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_name ON skills(name);

-- 5. StudentSkills Table (Öğrenci-yetenek ilişkisi)
CREATE TABLE student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) NOT NULL CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    years_of_experience DECIMAL(3,1) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    added_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, skill_id)
);

CREATE INDEX idx_student_skills_student ON student_skills(student_id);
CREATE INDEX idx_student_skills_skill ON student_skills(skill_id);
CREATE INDEX idx_student_skills_level ON student_skills(proficiency_level);

-- 6. Projects Table (Projeler)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    project_type VARCHAR(50) NOT NULL,
    duration_days INTEGER NOT NULL,
    budget_amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'TRY',
    location_city VARCHAR(100),
    location_requirement VARCHAR(50) CHECK (location_requirement IN ('Remote', 'On-site', 'Hybrid')) DEFAULT 'Remote',
    max_applicants INTEGER DEFAULT 30,
    application_deadline TIMESTAMP WITH TIME ZONE,
    project_start_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed', 'Cancelled')) DEFAULT 'Draft',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_city ON projects(location_city);
CREATE INDEX idx_projects_type ON projects(project_type);

-- 7. ProjectSkillRequirements Table (Proje skill gereksinimleri)
CREATE TABLE project_skill_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required_level VARCHAR(20) NOT NULL CHECK (required_level IN ('Beginner', 'Intermediate', 'Advanced')),
    is_mandatory BOOLEAN DEFAULT true,
    weight_percentage INTEGER DEFAULT 10,
    UNIQUE(project_id, skill_id)
);

CREATE INDEX idx_project_skills_project ON project_skill_requirements(project_id);
CREATE INDEX idx_project_skills_skill ON project_skill_requirements(skill_id);
CREATE INDEX idx_project_skills_mandatory ON project_skill_requirements(is_mandatory);

-- 8. Applications Table (Başvurular)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    cover_letter TEXT,
    application_status VARCHAR(20) CHECK (application_status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')) DEFAULT 'Pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, student_id)
);

CREATE INDEX idx_applications_project ON applications(project_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(application_status);