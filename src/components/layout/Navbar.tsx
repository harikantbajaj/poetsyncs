import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../store/AuthContext";

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Feather className="h-6 w-6 text-primary-600" />
          <motion.span
            className="text-xl font-semibold text-gray-900"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            PoetSync
          </motion.span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLinks />
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Nav Toggle */}
        <button
          className="p-2 rounded-md md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-40"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <MobileNavLinks closeMenu={() => setIsMenuOpen(false)} />
              <div className="flex flex-col space-y-2 pt-2 border-t">
                {user ? (
                  <>
                    <span className="text-sm text-gray-600 text-center">{user.email}</span>
                    <Button fullWidth variant="outline" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button fullWidth variant="outline" onClick={() => { setIsMenuOpen(false); navigate("/login"); }}>
                      Sign In
                    </Button>
                    <Button fullWidth onClick={() => { setIsMenuOpen(false); navigate("/signup"); }}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const NavLinks: React.FC = () => (
  <>
    <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium">
      Home
    </Link>
    <Link to="/create" className="text-gray-600 hover:text-primary-600 font-medium">
      Create
    </Link>
    <Link to="/explore" className="text-gray-600 hover:text-primary-600 font-medium">
      Explore
    </Link>
    <Link to="/library" className="text-gray-600 hover:text-primary-600 font-medium">
      My Library
    </Link>
    <Link to="/poem-to-image" className="text-gray-600 hover:text-primary-600 font-medium">
      Poem to Image
    </Link>
  </>
);

const MobileNavLinks: React.FC<{ closeMenu: () => void }> = ({ closeMenu }) => (
  <>
    <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium py-2" onClick={closeMenu}>
      Home
    </Link>
    <Link to="/create" className="text-gray-600 hover:text-primary-600 font-medium py-2" onClick={closeMenu}>
      Create
    </Link>
    <Link to="/explore" className="text-gray-600 hover:text-primary-600 font-medium py-2" onClick={closeMenu}>
      Explore
    </Link>
    <Link to="/library" className="text-gray-600 hover:text-primary-600 font-medium py-2" onClick={closeMenu}>
      My Library
    </Link>
    <Link to="/poem-to-image" className="text-gray-600 hover:text-primary-600 font-medium py-2" onClick={closeMenu}>
      Poem to Image
    </Link>
  </>
);
