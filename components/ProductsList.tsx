import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getProducts, deleteProduct, getErrorMessage } from '../services/api';
import { Product } from '../types';
import Spinner from './Spinner';
import PlusIcon from './icons/PlusIcon';
import ProductModal from './ProductModal';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from './auth/AuthContext';

const ProductsList: React.FC = () => {
    const { profile } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            setError(`No se pudieron cargar los productos: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) {
            return products;
        }
        return products.filter(product =>
            product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.aseguradora.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const handleOpenModal = (product: Product | null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchProducts();
    };

    const handleDeleteRequest = (product: Product) => {
        setProductToDelete(product);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await deleteProduct(productToDelete.id);
            fetchProducts();
        } catch (err) {
            alert(`No se pudo eliminar el producto: ${getErrorMessage(err)}`);
            console.error(err);
        } finally {
            setIsConfirmModalOpen(false);
            setProductToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-xs">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o aseguradora..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary p-2 pl-10 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Buscar productos"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>
                {profile?.rol === 'ADMIN' && (
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nuevo Producto
                    </button>
                )}
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Aseguradora</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">% Comisión</th>
                                <th className="p-4">Activo</th>
                                {profile?.rol === 'ADMIN' && <th className="p-4">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{product.nombre}</td>
                                    <td className="p-4 text-text-secondary">{product.aseguradora}</td>
                                    <td className="p-4 text-text-secondary capitalize">{product.categoria}</td>
                                    <td className="p-4 text-text-secondary">{product.comision_porcentaje}%</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.activo ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                            {product.activo ? 'Sí' : 'No'}
                                        </span>
                                    </td>
                                    {profile?.rol === 'ADMIN' && (
                                        <td className="p-4 space-x-2">
                                            <button onClick={() => handleOpenModal(product)} className="text-accent hover:underline">Editar</button>
                                            <button onClick={() => handleDeleteRequest(product)} className="text-red-500 hover:underline">Eliminar</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">
                            {searchTerm 
                                ? `No se encontraron productos para "${searchTerm}".`
                                : 'No se encontraron productos. Añade tu primer producto para empezar.'
                            }
                        </p>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <ProductModal
                    product={selectedProduct}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar el producto "${productToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Eliminar"
            />
        </>
    );
};

export default ProductsList;