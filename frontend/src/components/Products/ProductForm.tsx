import { createPortal } from 'react-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateProductMutation, useUpdateProductMutation } from '../../services/productApi';
import type { Product } from '../../types';
import { FiX, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

interface ProductFormProps {
    product?: Product;
    onClose: () => void;
}

const ProductForm = ({ product, onClose }: ProductFormProps) => {
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    const { register, control, handleSubmit, formState: { errors } } = useForm<Partial<Product>>({
        defaultValues: product || {
            name: '',
            description: '',
            category: 'General',
            variants: [{ sku: '', size: '', color: '', price: 0, stock: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants"
    });

    const onSubmit = async (data: Partial<Product>) => {
        try {
            if (product) {
                await updateProduct({ id: product._id, body: data }).unwrap();
            } else {
                await createProduct(data).unwrap();
            }
            onClose();
        } catch (err) {
            console.error('Failed to save product:', err);
            alert('Failed to save product');
        }
    };

    const isLoading = isCreating || isUpdating;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in text-left">
            <div className="bg-gray-900 rounded-3xl shadow-2xl shadow-blue-900/20 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-800">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{product ? 'Edit Product' : 'Add New Product'}</h2>
                        <p className="text-sm text-gray-400 font-medium">Enter product details and variants inventory</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-white group">
                        <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-gray-900/50">
                    {/* Base Info */}
                    <section className="space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Basic Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">Product Name</label>
                                <input
                                    {...register('name', { required: 'Name is required' })}
                                    className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600 font-medium"
                                    placeholder="e.g. Premium Cotton Hoodie"
                                />
                                {errors.name && <span className="text-red-400 text-xs font-medium">{errors.name.message}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">Category</label>
                                <div className="relative">
                                    <select
                                        {...register('category', { required: 'Category is required' })}
                                        className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer font-medium"
                                    >
                                        <option value="Fashion">Fashion</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Home">Home</option>
                                        <option value="General">General</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Description</label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none placeholder:text-gray-600 font-medium"
                                placeholder="Describe the product features and details..."
                            />
                        </div>
                    </section>

                    {/* Variants */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Variants & Stock Inventory</h3>
                            <button
                                type="button"
                                onClick={() => append({ sku: '', size: '', color: '', price: 0, stock: 0 })}
                                className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all px-4 py-2 rounded-lg active:scale-95"
                            >
                                <FiPlus size={16} />
                                <span>Add Variant</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-5 rounded-2xl border border-gray-800 bg-gray-800/30 flex flex-wrap lg:flex-nowrap items-end gap-4 group relative hover:border-gray-700 hover:bg-gray-800/50 transition-all duration-300">
                                    <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SKU Code</label>
                                        <input
                                            {...register(`variants.${index}.sku` as const, { required: 'Required' })}
                                            className="px-4 py-2.5 text-sm rounded-xl border border-gray-700 bg-gray-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:text-gray-600 font-mono transition-all"
                                            placeholder="SKU-001"
                                        />
                                    </div>
                                    <div className="w-full sm:w-24 flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Size</label>
                                        <input
                                            {...register(`variants.${index}.size` as const)}
                                            className="px-4 py-2.5 text-sm rounded-xl border border-gray-700 bg-gray-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:text-gray-600 transition-all"
                                            placeholder="M"
                                        />
                                    </div>
                                    <div className="w-full sm:w-32 flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Color</label>
                                        <input
                                            {...register(`variants.${index}.color` as const)}
                                            className="px-4 py-2.5 text-sm rounded-xl border border-gray-700 bg-gray-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:text-gray-600 transition-all"
                                            placeholder="Black"
                                        />
                                    </div>
                                    <div className="w-full sm:w-28 flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register(`variants.${index}.price` as const, { valueAsNumber: true, required: true })}
                                            className="px-4 py-2.5 text-sm rounded-xl border border-gray-700 bg-gray-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:text-gray-600 font-mono transition-all"
                                        />
                                    </div>
                                    <div className="w-full sm:w-24 flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock</label>
                                        <input
                                            type="number"
                                            {...register(`variants.${index}.stock` as const, { valueAsNumber: true, required: true })}
                                            className="px-4 py-2.5 text-sm rounded-xl border border-gray-700 bg-gray-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:text-gray-600 font-mono transition-all"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                        className="p-3 mb-0.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl disabled:opacity-0 transition-all"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </form>

                <div className="p-6 border-t border-gray-800 bg-gray-800/30 flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center gap-2 transition-all transform active:scale-95"
                    >
                        <FiSave size={18} />
                        <span>{isLoading ? 'Saving...' : 'Save Product'}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductForm;
