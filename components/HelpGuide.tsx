import React from 'react';
import ChartBarIcon from './icons/ChartBarIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import PresentationChartLineIcon from './icons/PresentationChartLineIcon';
import CogIcon from './icons/CogIcon';

interface GuideCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

const GuideCard: React.FC<GuideCardProps> = ({ icon, title, children }) => (
    <div className="bg-card p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
            <div className="bg-primary p-3 rounded-full mr-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-text-primary">{title}</h3>
        </div>
        <p className="text-text-secondary">{children}</p>
    </div>
);


const HelpGuide: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Bienvenido a SeguroCRM</h1>
                <p className="text-text-secondary mt-2">
                    Esta guía te ayudará a entender cómo funciona cada parte del CRM para que puedas gestionar tu trabajo de manera más eficiente.
                </p>
            </div>

            <div className="bg-secondary p-6 rounded-lg">
                 <h2 className="text-2xl font-bold mb-4">Guía por Secciones</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <GuideCard icon={<ChartBarIcon className="w-6 h-6 text-white"/>} title="Dashboard">
                        Es tu centro de control. Aquí puedes ver un resumen rápido de tus métricas más importantes: nuevos leads, tareas pendientes, pólizas activas y comisiones estimadas. Es el primer lugar que debes visitar cada día para tener una visión general de tu progreso.
                    </GuideCard>
                     <GuideCard icon={<ClipboardListIcon className="w-6 h-6 text-white"/>} title="Pipeline">
                        Visualiza y gestiona tu proceso de ventas. Arrastra y suelta los leads a través de las diferentes etapas (Nuevo, Contactado, Calificado, etc.). Esto te ayuda a identificar cuellos de botella y a concentrarte en los prospectos más prometedores.
                    </GuideCard>
                    <GuideCard icon={<UserGroupIcon className="w-6 h-6 text-white"/>} title="Clientes">
                        Aquí se centraliza toda la información de tus clientes. Una vez que un lead se marca como "GANADO", se convierte automáticamente en un cliente. Puedes editar su información y adjuntar archivos importantes como identificaciones o documentos.
                    </GuideCard>
                    <GuideCard icon={<ClipboardListIcon className="w-6 h-6 text-white"/>} title="Tareas">
                        La clave del seguimiento. Crea y gestiona todas tus actividades pendientes: llamadas, envío de correos, citas, etc. Asigna tareas a leads o clientes específicos para no olvidar nunca un seguimiento importante.
                    </GuideCard>
                     <GuideCard icon={<DocumentTextIcon className="w-6 h-6 text-white"/>} title="Pólizas">
                        Administra todas las pólizas de tus clientes. Puedes crear nuevas pólizas, asociarlas a un cliente y un producto, y llevar un registro de su estado, fechas de vencimiento y comisiones generadas. También puedes adjuntar la carátula de la póliza.
                    </GuideCard>
                    <GuideCard icon={<PresentationChartLineIcon className="w-6 h-6 text-white"/>} title="Reportes">
                        Obtén información valiosa sobre tu cartera. El principal reporte te muestra las pólizas que están a punto de vencer, permitiéndote contactar a tus clientes con anticipación para gestionar la renovación y asegurar la retención.
                    </GuideCard>
                     <GuideCard icon={<CogIcon className="w-6 h-6 text-white"/>} title="Configuración (Admin)">
                        Si eres administrador, esta es tu área para gestionar la plataforma. Puedes añadir y configurar los productos que ofreces, crear nuevos usuarios (agentes), y organizar a tus agentes en equipos para una mejor supervisión.
                    </GuideCard>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Flujo de Trabajo Recomendado</h2>
                <ol className="list-decimal list-inside space-y-3 text-text-secondary">
                    <li><strong>Captura un Lead:</strong> Todo comienza creando un nuevo prospecto en la sección de <strong>Pipeline</strong>.</li>
                    <li><strong>Realiza Seguimiento con Tareas:</strong> Crea tareas en la sección de <strong>Tareas</strong> asociadas a ese lead para llamarlo, enviarle un correo o agendar una cita.</li>
                    <li><strong>Avanza el Lead en el Pipeline:</strong> A medida que interactúas con el lead, muévelo por las columnas del <strong>Pipeline</strong> hasta que esté listo para comprar.</li>
                    <li><strong>Convierte a Cliente:</strong> ¡Felicidades! Cuando el lead se mueve a "GANADO", se crea automáticamente un registro en <strong>Clientes</strong>.</li>
                    <li><strong>Genera la Póliza:</strong> Ve a la sección de <strong>Pólizas</strong> y crea una nueva póliza para tu cliente, asociándola con el producto que adquirió.</li>
                    <li><strong>Gestiona la Renovación:</strong> Usa la sección de <strong>Reportes</strong> para anticiparte al vencimiento de la póliza y gestionar la renovación.</li>
                </ol>
            </div>
            
             <div className="bg-card p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Consejos Profesionales</h2>
                <ul className="list-disc list-inside space-y-3 text-text-secondary">
                    <li><strong>Mantén las tareas actualizadas:</strong> Tu tablero de tareas es tu mejor amigo. Marca las tareas como completadas para mantener tu lista de pendientes limpia y enfocada.</li>
                    <li><strong>Usa las notas:</strong> En cada lead, aprovecha el campo de notas para registrar información clave de tus conversaciones. ¡Tu "yo" del futuro te lo agradecerá!</li>
                    <li><strong>Adjunta todo:</strong> Usa la funcionalidad de adjuntar archivos en Clientes y Pólizas. Tener toda la documentación en un solo lugar te ahorrará mucho tiempo.</li>
                    <li><strong>Revisa el Dashboard a diario:</strong> Haz del Dashboard tu página de inicio. Te dará la motivación y la dirección que necesitas para empezar el día con el pie derecho.</li>
                </ul>
            </div>

        </div>
    );
};

export default HelpGuide;
