import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '../services/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { useAppDispatch } from '../app/hooks';
import { FiMail, FiLock, FiUser, FiPhone, FiCreditCard, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const Register = () => {
    const { register: formRegister, handleSubmit, formState: { errors } } = useForm();
    const [registerUser, { isLoading }] = useRegisterMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            const registrationData = {
                companyName: data.companyName,
                email: data.email,
                phone: data.phone,
                ownerName: data.name,
                ownerEmail: data.email,
                password: data.password
            };
            const response = await registerUser(registrationData).unwrap();
            dispatch(setCredentials(response.data));
            toast.success('Registration successful! Welcome aboard.');
            navigate('/');
        } catch (err: any) {
            const msg = err.data?.message || 'Registration failed';
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 relative overflow-hidden py-10">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-gray-900 to-gray-900"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            {/* Animated Orbs */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 w-full max-w-5xl px-4 animate-fade-in">
                <div className="flex flex-col lg:flex-row bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">

                    {/* Left Side - Info */}
                    <div className="lg:w-2/5 p-10 bg-gradient-to-br from-blue-600/90 to-blue-800/90 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold mb-4">Join InventoryPro</h1>
                            <p className="text-blue-100 leading-relaxed mb-8">
                                Transform your business with powerful inventory tracking, real-time analytics, and seamless order management.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                        <FiCheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Real-time Tracking</h3>
                                        <p className="text-sm text-blue-100">Monitor stock levels instantly across all locations</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                        <FiCheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Smart Analytics</h3>
                                        <p className="text-sm text-blue-100">Data-driven insights to optimize your supply chain</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                        <FiCheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Automated POs</h3>
                                        <p className="text-sm text-blue-100">Auto-generate purchase orders when stock is low</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-12 pt-8 border-t border-white/20">
                            <p className="text-sm text-blue-100 font-medium">Trusted by 500+ businesses worldwide</p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="lg:w-3/5 p-10 bg-gray-900/50">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                            <p className="text-gray-400">Get started with your free trial today</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Company Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                                <FiCreditCard size={18} />
                                            </div>
                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                                placeholder="Acme Inc."
                                                {...formRegister('companyName', { required: 'Company name is required' })}
                                            />
                                        </div>
                                        {errors.companyName && <span className="text-red-400 text-xs ml-1">{errors.companyName.message as string}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                                <FiUser size={18} />
                                            </div>
                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                                placeholder="John Doe"
                                                {...formRegister('name', { required: 'Name is required' })}
                                            />
                                        </div>
                                        {errors.name && <span className="text-red-400 text-xs ml-1">{errors.name.message as string}</span>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                            <FiMail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                            placeholder="john@company.com"
                                            {...formRegister('email', { required: 'Email is required' })}
                                        />
                                    </div>
                                    {errors.email && <span className="text-red-400 text-xs ml-1">{errors.email.message as string}</span>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                                <FiPhone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                                placeholder="+1 (555) 000-0000"
                                                {...formRegister('phone', { required: 'Phone is required' })}
                                            />
                                        </div>
                                        {errors.phone && <span className="text-red-400 text-xs ml-1">{errors.phone.message as string}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                                <FiLock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                                placeholder="••••••••"
                                                {...formRegister('password', { required: 'Password is required', minLength: 6 })}
                                            />
                                        </div>
                                        {errors.password && <span className="text-red-400 text-xs ml-1">{errors.password.message as string}</span>}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Get Started Now
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="text-center text-sm text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold hover:underline">
                                    Sign In
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
