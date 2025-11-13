import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, deleteProduct, getErrorMessage } from '../services/api';
import { Product } from '../types';
import Spinner from './Spinner';
import PlusIcon from './icons/PlusIcon';
import ProductModal from './ProductModal';

const ProductsList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await deleteProduct(id);
                fetchProducts();
            } catch (err) {
                alert(`No se pudo eliminar el producto: ${getErrorMessage(err)}`);
                console.error(err);
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nuevo Producto
                </button>
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
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b border-border hover:bg-secondary">
                                    <td className="p-4 font-medium">{product.nombre}</td>
                                    <td className="p-4 text-text-secondary">{product.aseguradora}</td>
                                    <td className="p-4 text-text-secondary">{product.categoria}</td>
                                    <td className="p-4 text-text-secondary">{product.comision_porcentaje}%</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.activo ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                            {product.activo ? 'Sí' : 'No'}
                                        </span>
                                    </td>
                                    <td className="p-4 space-x-2">
                                        <button onClick={() => handleOpenModal(product)} className="text-accent hover:underline">Editar</button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <p className="text-center p-8 text-text-secondary">No se encontraron productos. Añade tu primer producto para empezar.</p>
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
        </>
    );
};

export default ProductsList;