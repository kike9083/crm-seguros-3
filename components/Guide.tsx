import React from 'react';

const Guide: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Guía de Uso del SeguroCRM</h1>
        <p className="text-lg text-text-secondary">
          Bienvenido a la versión actualizada de tu CRM. Esta guía te ayudará a entender las nuevas funciones operativas, la gestión de documentos, el seguimiento de metas, los reportes inteligentes y las herramientas de comunicación rápida.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-text-primary border-b border-border pb-2">Novedades y Funciones Principales</h2>
        
        {/* 1. DASHBOARD */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">1. Dashboard Operativo y Metas</h3>
          <p className="text-text-secondary">El nuevo Dashboard no solo muestra resultados, sino tu actividad diaria.</p>
          
          <div className="bg-secondary p-4 rounded-lg space-y-3">
            <h4 className="font-bold text-text-primary">Actividad Operativa (¿De dónde salen los números?)</h4>
            <ul className="list-disc list-inside text-text-secondary ml-2 space-y-1">
              <li><strong>Reuniones Pendientes:</strong> Suma de tareas tipo <em>"CITA"</em> que aún están en estatus <em>"PENDIENTE"</em>.</li>
              <li><strong>Personas Contactadas:</strong> Tu historial de productividad. Suma tareas (Llamadas, Citas, WhatsApp) que has marcado como <em>"COMPLETADA"</em>.</li>
              <li><strong>Interesados (V2/V3):</strong> Total de Leads que has movido a las etapas avanzadas del Pipeline.</li>
              <li><strong>Citas Esta Semana:</strong> Tareas tipo <em>"CITA"</em> con fecha de vencimiento dentro de la semana actual.</li>
            </ul>
          </div>

          <div className="bg-secondary p-4 rounded-lg space-y-3">
            <h4 className="font-bold text-text-primary">Metas Mensuales (Basadas en Comisiones)</h4>
            <ul className="list-disc list-inside text-text-secondary ml-2 space-y-1">
              <li><strong>Configuración:</strong> Haz clic en el botón "Configurar Meta" (icono de engranaje) para establecer cuánto quieres ganar en comisiones este mes en Vida, AP y Salud.</li>
              <li><strong>Progreso:</strong> Las barras se llenan automáticamente con la <strong>comisión mensual generada</strong> de las pólizas "ACTIVAS" emitidas en el mes actual.</li>
            </ul>
          </div>
        </article>

        {/* 2. LEADS Y CLIENTES */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">2. Gestión de Leads y Clientes</h3>
          <p className="text-text-secondary">Hemos potenciado la comunicación y la organización de tu cartera.</p>
          
          <div className="bg-secondary p-3 rounded mb-3 border-l-4 border-blue-500">
             <h4 className="font-bold text-white mb-2 flex items-center">
                Carga Masiva de Datos 🚀
             </h4>
             <p className="text-sm text-text-secondary mb-2">
                ¿Tienes una lista de prospectos en Excel? Usa el botón <strong>"Importar Leads"</strong> en la sección "Lista Leads".
             </p>
             <ul className="list-disc list-inside text-text-secondary ml-2 space-y-1 text-sm">
                <li>Descarga la plantilla CSV proporcionada en la ventana de importación.</li>
                <li>Copia y pega tus datos respetando las columnas.</li>
                <li>Sube el archivo para crear múltiples leads en segundos. Se asignarán automáticamente a tu usuario.</li>
             </ul>
          </div>

          <div className="bg-secondary p-3 rounded mb-3 border-l-4 border-green-500">
             <h4 className="font-bold text-white mb-2 flex items-center">
                Comunicación en un Clic 📞 💬
             </h4>
             <ul className="list-disc list-inside text-text-secondary ml-2 space-y-2 text-sm">
                <li>
                    <strong>Llamada Directa:</strong> Haz clic en el número de teléfono para iniciar la llamada.
                </li>
                <li>
                    <strong>WhatsApp Directo:</strong> Usa el icono de WhatsApp para abrir el chat sin guardar el contacto.
                </li>
             </ul>
          </div>

          <div className="bg-secondary p-3 rounded mb-3">
             <h4 className="font-bold text-white mb-1">Nuevas Etapas del Pipeline</h4>
             <ul className="list-disc list-inside text-text-secondary ml-2 space-y-1 text-sm">
                <li><strong>PROSPECTO:</strong> Lead nuevo o sin contactar.</li>
                <li><strong>V1 (Validación):</strong> Primer contacto realizado.</li>
                <li><strong>V2 (Valoración):</strong> Propuesta enviada o en negociación.</li>
                <li><strong>V3 (Venta):</strong> Cierre inminente.</li>
                <li><strong>GANADO:</strong> Venta cerrada (Se convierte a Cliente).</li>
                <li><strong>NO INTERESADO:</strong> Lead descartado.</li>
             </ul>
          </div>
        </article>

        {/* 3. PÓLIZAS (NUEVO SISTEMA) */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">3. Gestión Avanzada de Pólizas</h3>
          <p className="text-text-secondary">Ahora puedes crear pólizas multi-producto con cálculos automáticos.</p>
          
          <div className="bg-secondary p-3 rounded mb-3">
             <h4 className="font-bold text-white mb-1">Multi-Producto y Totales</h4>
             <ul className="list-disc list-inside text-text-secondary ml-2 space-y-1 text-sm">
                <li><strong>Selección Múltiple:</strong> Puedes agregar varios productos (ej. Vida + Gastos Médicos) a una sola póliza.</li>
                <li><strong>Personalización:</strong> Al agregar un producto, puedes definir manualmente la <strong>Prima Mensual</strong> y la <strong>Suma Asegurada</strong> específica para ese cliente.</li>
                <li><strong>Cálculo Automático:</strong> El sistema sumará automáticamente las primas y calculará la comisión estimada basada en el porcentaje configurado en el producto base.</li>
                <li><strong>Visualización Anual:</strong> En la lista de pólizas verás tanto los valores mensuales como la proyección anualizada.</li>
             </ul>
          </div>
        </article>

        {/* 4. REPORTES Y COMISIONES */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">4. Reportes y Comisiones</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-secondary p-3 rounded">
                <h4 className="font-bold text-white mb-1">Sección Comisiones</h4>
                <p className="text-sm text-text-secondary">Nueva vista dedicada para ver cuánto has generado.</p>
                <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                    <li>Tabla detallada por agente.</li>
                    <li>Filtros por mes y año.</li>
                    <li>Cálculo automático basado en las pólizas activas del periodo.</li>
                </ul>
            </div>
            <div className="bg-secondary p-3 rounded">
                <h4 className="font-bold text-white mb-1">Reportes Inteligentes</h4>
                <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                    <li><strong>Auditoría (Solo Admin):</strong> Historial de quién creó, editó o eliminó registros.</li>
                    <li><strong>Exportación (Solo Admin):</strong> Descarga tu base de datos completa a Excel/CSV.</li>
                    <li><strong>Alertas:</strong> Monitor de renovaciones próximas.</li>
                </ul>
            </div>
          </div>
        </article>

        {/* 5. CONFIGURACIÓN */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">5. Configuración</h3>
          <p className="text-text-secondary text-sm">Recuerda que en la pestaña "General" puedes cambiar tu contraseña y en "Equipo" (Solo Admin) gestionar a tus usuarios.</p>
        </article>
      </section>

      <section className="space-y-4 pt-6 border-t border-border">
        <h2 className="text-2xl font-semibold text-text-primary">Flujo de Trabajo Recomendado</h2>
        
        <div className="bg-secondary p-5 rounded-lg border-l-4 border-primary">
            <ol className="list-decimal list-inside space-y-3 text-text-secondary">
                <li>
                    <strong>Configuración Inicial:</strong> Define tus Metas Mensuales en el Dashboard y asegúrate de que tus Productos tengan el porcentaje de comisión correcto.
                </li>
                <li>
                    <strong>Captura:</strong> Usa la Importación Masiva para cargar tu base o crea leads manualmente. Clasifícalos como "PROSPECTO".
                </li>
                <li>
                    <strong>Seguimiento:</strong> Avanza el lead por las etapas V1 -> V2 -> V3 usando Tareas para agendar citas y llamadas.
                </li>
                <li>
                    <strong>Cierre:</strong> Al llegar a "GANADO", el sistema crea al Cliente. Ve a la sección de Pólizas y crea el contrato.
                </li>
                <li>
                    <strong>Emisión:</strong> Agrega los productos vendidos a la póliza, ajustando la prima real. Sube la carátula PDF.
                </li>
                <li>
                    <strong>Cobro:</strong> Verifica en la sección "Comisiones" tu pago estimado del mes.
                </li>
            </ol>
        </div>
      </section>
    </div>
  );
};

export default Guide;