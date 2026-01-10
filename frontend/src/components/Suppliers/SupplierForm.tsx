import React from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { useCreateSupplierMutation, useUpdateSupplierMutation } from '../../services/supplierApi';
import type { Supplier } from '../../services/supplierApi';
import { FiX, FiSave, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

interface SupplierFormProps {
    supplier?: Supplier;
    onClose: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onClose }) => {
    const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
    const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();

    const { register, handleSubmit, formState: { errors } } = useForm<Partial<Supplier>>({
        defaultValues: supplier || {
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: ''
        }
    });

    const onSubmit = async (data: Partial<Supplier>) => {
        try {
            if (supplier) {
                await updateSupplier({ id: supplier._id, body: data }).unwrap();
            } else {
                await createSupplier(data).unwrap();
            }
            onClose();
        } catch (err) {
            alert('Failed to save supplier');
        }
    };

    const isLoading = isCreating || isUpdating;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-gray-900 rounded-3xl shadow-2xl shadow-blue-900/20 w-full max-w-lg overflow-hidden flex flex-col border border-gray-800 animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                        <p className="text-sm text-gray-400 font-medium">Capture partner contact details</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-white group">
                        <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div className="space-y-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                <FiUser size={12} /> Company Name
                            </label>
                            <input
                                {...register('name', { required: 'Company name is required' })}
                                className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600 text-sm font-medium"
                                placeholder="e.g. Acme Industries"
                            />
                            {errors.name && <span className="text-red-400 text-[10px] font-bold uppercase">{errors.name.message}</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                <FiUser size={12} /> Contact Person
                            </label>
                            <input
                                {...register('contactPerson', { required: 'Contact person is required' })}
                                className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600 text-sm font-medium"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <FiMail size={12} /> Email
                                </label>
                                <input
                                    type="email"
                                    {...register('email', { required: 'Email is required' })}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600 text-sm font-medium"
                                    placeholder="supplier@example.com"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <FiPhone size={12} /> Phone
                                </label>
                                <input
                                    {...register('phone', { required: 'Phone is required' })}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600 text-sm font-medium"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                <FiMapPin size={12} /> Address
                            </label>
                            <textarea
                                {...register('address')}
                                rows={2}
                                className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600 text-sm font-medium resize-none"
                                placeholder="Business address..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-all border border-gray-700 hover:border-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                            <FiSave size={18} />
                            <span>{isLoading ? 'Saving...' : 'Save Supplier'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default SupplierForm;
