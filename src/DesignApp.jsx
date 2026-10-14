import React from 'react';
import App from './pages/home/HomePage.jsx';
import AuthPage from './pages/auth/AuthPage.jsx';
import DashboardPage from './pages/portal/DashboardPage.jsx';
import MyCoursesPage from './pages/portal/MyCoursesPage.jsx';
import CatalogPage from './pages/portal/CatalogPage.jsx';
import SchedulePage from './pages/portal/SchedulePage.jsx';
import AssignmentsPage from './pages/portal/AssignmentsPage.jsx';
import ExaminationsPage from './pages/portal/ExaminationsPage.jsx';
import RecordsPage from './pages/portal/RecordsPage.jsx';
import SignOutPage from './pages/portal/SignOutPage.jsx';
import StudentServicesPage from './pages/portal/StudentServicesPage.jsx';
import AdminUsersPage from './pages/portal/AdminUsersPage.jsx';
import DesignGallery from './pages/gallery/DesignGallery.jsx';
import AboutPage from './pages/about/AboutPage.jsx';
import AnimatedReferencePage from './components/shared/AnimatedReferencePage.jsx';
import './design-app.css';
import './design-assets.css';
import './design-brand.css';

const designs = [
  { slug: 'home', title: 'Public University Website', description: 'EduCore\u2019s public university homepage.', folder: 'public_university_website_home' },
  { slug: 'about', title: 'About EduCore', description: 'University history, colleges, and academic distinction.', folder: 'about_educore_university_colleges_history' },
  { slug: 'apply', title: 'Sign Up & Admissions', description: 'EduCore account registration and application experience.', folder: 'educore_university_authentication_sign_up' },
  { slug: 'crest', title: 'University Crest & Wordmark', description: 'Official EduCore University brand identity.', folder: 'educore_university_official_crest_wordmark' },
  { slug: 'dashboard', title: 'Learning Portal Dashboard', description: 'Student coursework, progress, and learning tools.', folder: 'student_learning_portal_academic_dashboard' },
  { slug: 'records', title: 'Student Records & Digital Library', description: 'Academic records, CBT exams, and library services.', folder: 'student_records_cbt_exams_digital_library' },
];

const suppliedAssets = [
  { title: 'Modern University Campus', description: 'Campus photography supplied with the university designs.', file: 'campus.png' },
  { title: 'Student Portrait', description: 'Student portrait supplied with the university designs.', file: 'student-portrait.png' },
  { title: 'EduCore Wordmark', description: 'Vector crest and wordmark supplied with the university designs.', file: 'educore-wordmark.svg' },
];

export default function DesignApp() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  if (pathname === '/designs') return <DesignGallery designs={designs} suppliedAssets={suppliedAssets} />;
  const slug = pathname === '/' ? 'home' : pathname.slice(1);
  if (slug === 'home') return <App />;
  if (slug === 'records') return <RecordsPage />;
  if (slug === 'signup' || slug === 'register' || slug === 'apply' || slug === 'admissions') return <AuthPage initialMode="signup" />;
  if (slug === 'forgot-password') return <AuthPage initialMode="reset" />;
  if (slug === 'reset-password') return <AuthPage initialMode="reset-confirm" />;
  if (slug === 'login') return <AuthPage />;
  if (slug === 'signout' || slug === 'sign-out') return <SignOutPage />;
  if (slug === 'my-courses' || slug === 'courses') return <MyCoursesPage />;
  if (slug === 'catalog' || slug === 'course-catalog') return <CatalogPage />;
  if (slug === 'schedule' || slug === 'timetable') return <SchedulePage />;
  if (slug === 'assignments' || slug === 'coursework') return <AssignmentsPage />;
  if (slug === 'examinations' || slug === 'exams') return <ExaminationsPage />;
  if (slug === 'library') return <StudentServicesPage type="library"/>;
  if (slug === 'finance') return <StudentServicesPage type="finance"/>;
  if (slug === 'announcements') return <StudentServicesPage type="announcements"/>;
  if (slug === 'admin/users') return <AdminUsersPage/>;
  const design = designs.find((item) => item.slug === slug);
  if (!design) return <main className="route-not-found"><div><span>404 · PAGE NOT FOUND</span><h1>We couldn’t find that EduCore page.</h1><p>Use the navigation to return to the university home page or continue to your student account.</p><div><a href="/">University Home</a><a href="/login">Student Sign In</a></div></div></main>;
  if (slug === 'dashboard') return <DashboardPage />;
  if (slug === 'about') return <AboutPage design={design} />;
  const source = `/reference-pages/${design.folder}/code.html`;
  return <AnimatedReferencePage title={design.title} src={source} />;
}
