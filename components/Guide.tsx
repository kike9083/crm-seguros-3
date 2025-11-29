import React from 'react';

const Guide: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Guía de Uso del SeguroCRM</h1>
        <p className="text-lg text-text-secondary">
          Bienvenido a la versión actualizada de tu CRM. Esta guía te ayudará a entender las nuevas funciones operativas, la gestión de documentos y el seguimiento de metas.
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
              <li><strong>Interesados (Pendientes):</strong> Total de Leads que has movido a la columna <em>"CALIFICADO"</em> en el Pipeline.</li>
              <li><strong>Citas Esta Semana:</strong> Tareas tipo <em>"CITA"</em> con fecha de vencimiento dentro de la semana actual.</li>
            </ul>
          </div>

          <div className="bg-secondary p-4 rounded-lg space-y-3">
            <h4 className="font-bold text-text-primary">Metas Mensuales</h4>
            <ul className="list-disc list-inside text-text-secondary ml-2 space-y-1">
              <li><strong>Configuración:</strong> Haz clic en el botón "Configurar Meta" (icono de engranaje) para establecer cuánto quieres vender este mes en Vida, AP y Salud.</li>
              <li><strong>Progreso:</strong> Las barras se llenan automáticamente cuando registras Pólizas "ACTIVAS" que coincidan con la categoría del producto (ej. un producto con categoría "Vida" suma a la meta de Vida).</li>
            </ul>
          </div>
        </article>

        {/* 2. LEADS Y CLIENTES */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">2. Gestión de Leads y Clientes (Datos Extendidos)</h3>
          <p className="text-text-secondary">Hemos homologado los formularios. Ahora puedes capturar información detallada desde el principio.</p>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Nuevos Campos:</strong> Ocupación, Ingresos Mensuales, Fecha de Nacimiento y Pólizas Externas.</li>
            <li><strong>Transición Automática:</strong> Al ganar un Lead, toda esta información se transfiere automáticamente a la ficha del Cliente.</li>
            <li><strong>Archivos Adjuntos:</strong> Ahora puedes subir documentos (INE, Comprobantes, Cotizaciones) directamente en la ficha del Lead o del Cliente. Los archivos son privados y seguros.</li>
          </ul>
        </article>

        {/* 3. TAREAS */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">3. Tareas y Seguimientos</h3>
          <p className="text-text-secondary">El motor de tu productividad.</p>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Tipos de Tarea:</strong> Clasifica tus acciones en Llamada, Email, Cita o WhatsApp.</li>
            <li><strong>Importancia de Completar:</strong> Es vital marcar las tareas como <em>"COMPLETADA"</em> cuando las realices; esto alimenta tu contador de "Personas Contactadas" en el Dashboard.</li>
          </ul>
        </article>

        {/* 4. PÓLIZAS */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">4. Pólizas y Archivos</h3>
          <p className="text-text-secondary">Gestión documental completa.</p>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Carátulas y Recibos:</strong> Usa el botón "Añadir Archivo" dentro de cualquier póliza para guardar la carátula, recibos de pago o condiciones generales.</li>
            <li><strong>Descarga Segura:</strong> Solo los usuarios autorizados pueden descargar estos archivos.</li>
          </ul>
        </article>

        {/* 5. PRODUCTOS */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">5. Catálogo de Productos</h3>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Categorización:</strong> Al crear un producto, asegúrate de seleccionar la <strong>Categoría</strong> correcta (Vida, Salud, AP). Esto es crucial para que las ventas se reflejen en la barra de meta correcta en el Dashboard.</li>
          </ul>
        </article>

        {/* 6. CONFIGURACIÓN */}
        <article className="space-y-2">
          <h3 className="text-xl font-medium text-accent">6. Configuración</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-secondary p-3 rounded">
                <h4 className="font-bold text-white">Pestaña General (Todos)</h4>
                <p className="text-sm text-text-secondary">Aquí puedes actualizar tu nombre de perfil y cambiar tu contraseña de acceso de forma segura.</p>
            </div>
            <div className="bg-secondary p-3 rounded">
                <h4 className="font-bold text-white">Pestaña Equipo (Solo Admin)</h4>
                <p className="text-sm text-text-secondary">Gestiona a tus agentes. Puedes crear nuevos usuarios, asignar roles (Admin/Agente) y ver sus IDs para asignaciones.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-4 pt-6 border-t border-border">
        <h2 className="text-2xl font-semibold text-text-primary">Flujo de Trabajo Recomendado</h2>
        
        <div className="bg-secondary p-5 rounded-lg border-l-4 border-primary">
            <ol className="list-decimal list-inside space-y-3 text-text-secondary">
                <li>
                    <strong>Inicio de Mes:</strong> Ve al Dashboard, abre "Configurar Meta" y define tus objetivos de venta para Vida, AP y Salud.
                </li>
                <li>
                    <strong>Captura:</strong> Crea un <strong>Lead</strong> nuevo. Rellena los datos financieros (Ingresos) y adjunta su identificación en la sección de Archivos.
                </li>
                <li>
                    <strong>Seguimiento:</strong> Crea una <strong>Tarea</strong> tipo "CITA" para reunirte con él. Esto aparecerá en "Reuniones Pendientes".
                </li>
                <li>
                    <strong>Cierre:</strong> Cuando la venta se concrete, arrastra el Lead a "GANADO". El sistema creará al Cliente automáticamente.
                </li>
                <li>
                    <strong>Emisión:</strong> Ve a <strong>Pólizas</strong>, crea la nueva póliza asociada a ese cliente y al producto vendido. Sube la carátula PDF en la sección de archivos de la póliza.
                </li>
                <li>
                    <strong>Resultado:</strong> Verifica tu Dashboard. Verás que la barra de progreso de la meta correspondiente ha avanzado y tu contador de "Personas Contactadas" ha subido al completar la tarea.
                </li>
            </ol>
        </div>
      </section>
    </div>
  );
};

export default Guide;