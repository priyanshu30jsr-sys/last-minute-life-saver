import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { use3DTilt } from '../hooks/use3DTilt';
import { useAuth } from '../context/AuthContext';
import { register as registerService } from '../services/authService';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import MorphingBlob from '../animations/MorphingBlob';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt(8);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await registerService(form.name, form.email, form.password);
      login(data);
      show('Account created! Let\'s get you unstuck. 🚀', 'success');
      navigate('/chat');
    } catch (err) {
      show(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 relative overflow-hidden">
      <MorphingBlob color="#34A853" size={500} opacity={0.10}
        className="top-1/3 right-1/4" />
      <MorphingBlob color="#8B5CF6" size={380} opacity={0.09}
        className="bottom-1/3 left-1/4" />

      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass border border-white/10 rounded-3xl p-8 w-full max-w-md relative z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gblu to-gpurp
            flex items-center justify-center shadow-glow">
            <i className="ti ti-bolt text-white" />
          </div>
          <span className="font-black text-white text-lg">LifeSaver AI</span>
        </div>

        <h1 className="text-2xl font-black text-white mb-1">Create account</h1>
        <p className="text-white/50 text-sm mb-8">Your autonomous AI teammate awaits.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {['name', 'email', 'password'].map(field => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-white/60 text-sm font-medium capitalize">{field}</label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                required
                className="glass border border-white/10 rounded-xl px-4 py-3 text-white
                  placeholder-white/25 outline-none text-sm focus:border-gblu/50 transition-colors"
                placeholder={
                  field === 'name'     ? 'Your full name'     :
                  field === 'email'    ? 'you@example.com'    :
                  'Min. 6 characters'
                }
              />
            </div>
          ))}

          <Button
            type="submit"
            loading={loading}
            variant="gradient"
            size="lg"
            className="w-full mt-2 justify-center"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gblu hover:text-blue-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;