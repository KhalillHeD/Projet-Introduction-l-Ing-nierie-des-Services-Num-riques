import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, Globe, Pill } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { path: "/", label: t.nav.home },
    { path: "/about", label: t.nav.about },
    { path: "/pharmacies", label: t.nav.pharmacies },
    { path: "/search", label: t.nav.searchMeds },
    { path: "/customers", label: t.nav.forCustomers },
    { path: "/contact", label: t.nav.contact },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Pill className="h-8 w-8 text-[#007BFF]" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Pharmalovo
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 dark:text-gray-300 hover:text-[#007BFF] dark:hover:text-[#4da3ff] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-1 rtl:space-x-reverse"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === "en" ? "AR" : "EN"}
              </span>
            </button>

            {user ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#007BFF] dark:hover:text-[#4da3ff] transition-colors duration-200"
                >
                  {user.name}
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    {t.nav.login}
                  </Button>
                </Link>

                <Link to="/register">
                  <Button size="sm">{t.nav.register}</Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
              <button
                onClick={toggleTheme}
                className="flex-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                {isDark ? (
                  <>
                    <Sun className="h-5 w-5" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" />
                    <span>Dark</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleLanguage}
                className="flex-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <Globe className="h-5 w-5" />
                <span>{language === "en" ? "عربي" : "English"}</span>
              </button>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              {user ? (
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={async () => {
                    await handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  {t.nav.logout}
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="md" fullWidth>
                      {t.nav.login}
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button size="md" fullWidth>
                      {t.nav.register}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
