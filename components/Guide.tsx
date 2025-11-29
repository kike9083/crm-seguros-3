
import React from 'react';

const Guide: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Guía de Uso del SeguroCRM</h1>
        <p className="text-lg text-text-secondary">
          Este CRM está diseñado para ayudarte a gestionar todo el ciclo de vida de tus clientes y pólizas, desde el primer contacto hasta el seguimiento y renovación.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary border-b border-border pb-2">Secciones Principales:</h2>
        
        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">1. Dashboard</h3>
          <p className="text-text-secondary">Tu resumen ejecutivo. Aquí verás métricas clave como nuevos leads, tareas pendientes, pólizas activas y comisiones estimadas. También muestra un gráfico del progreso de tu pipeline y tus próximos seguimientos.</p>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">2. Pipeline de Ventas (Leads)</h3>
          <p className="text-text-secondary">Aquí gestionas a tus potenciales clientes. Cada tarjeta representa un "Lead" y puedes arrastrarlas entre diferentes estados (Nuevo, Contactado, Calificado, Perdido, Ganado).</p>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Crear Lead</strong>: Haz clic en "Nuevo Lead" para añadir un prospecto.</li>
            <li><strong>Editar Lead</strong>: Haz clic en cualquier tarjeta de Lead para editar su información.</li>
            <li><strong>Promover a Cliente</strong>: Cuando un lead se mueve al estado "GANADO", automáticamente se convierte en un cliente en la sección "Clientes".</li>
          </ul>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">3. Clientes</h3>
          <p className="text-text-secondary">Tu base de datos de clientes activos. Aquí encuentras toda la información de contacto y puedes adjuntar archivos relevantes.</p>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Editar Cliente</strong>: Haz clic en un cliente para actualizar sus datos o adjuntar documentos (ej. copias de identificación, contratos).</li>
            <li><strong>Eliminar Cliente (Solo Admin)</strong>: Los administradores pueden eliminar clientes.</li>
          </ul>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">4. Tareas y Seguimientos</h3>
          <p className="text-text-secondary">Centraliza todas tus actividades pendientes. Puedes ver tareas por estado (Pendiente, En Progreso, Completada) y moverlas entre columnas.</p>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Crear Tarea</strong>: Asocia tareas a Leads o Clientes (ej. "Llamar a Juan Pérez", "Enviar propuesta a María López").</li>
            <li><strong>Editar Tarea</strong>: Haz clic en una tarea para modificarla.</li>
          </ul>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">5. Pólizas</h3>
          <p className="text-text-secondary">Gestiona todas las pólizas de tus clientes.</p>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Crear Póliza</strong>: Asocia una póliza a un cliente y un producto. Calcula automáticamente la comisión.</li>
            <li><strong>Editar Póliza</strong>: Modifica los detalles de una póliza, su estatus o adjunta documentos.</li>
            <li><strong>Eliminar Póliza (Solo Admin)</strong>: Los administradores pueden eliminar pólizas.</li>
          </ul>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">6. Productos</h3>
          <p className="text-text-secondary">Tu catálogo de productos de seguros. Solo los administradores pueden crear, editar o eliminar productos. Los agentes pueden ver la lista.</p>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Crear/Editar Producto (Solo Admin)</strong>: Define el nombre, aseguradora, comisión, precio base y si está activo.</li>
          </ul>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">7. Reportes</h3>
          <p className="text-text-secondary">Obtén una visión general de métricas importantes, como pólizas próximas a vencer. Puedes filtrar por rango de días.</p>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">8. Configuración</h3>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Equipo (Solo Admin)</strong>: Gestiona los usuarios del CRM (agentes y administradores). Puedes crear nuevos usuarios y asignar roles.</li>
            <li><strong>General</strong>: Próximamente incluirá opciones generales de la plataforma.</li>
          </ul>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary border-b border-border pb-2">Ejemplo de Flujo de Trabajo Real: "De Prospecto a Póliza Activa"</h2>
        <p className="text-text-secondary">Imaginemos a <strong>Juan</strong>, un agente de seguros, quien acaba de recibir un nuevo lead.</p>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">Paso 1: Captura del Lead</h3>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Acción</strong>: Juan va a <strong>Pipeline de Ventas</strong> y hace clic en "Nuevo Lead".</li>
            <li><strong>Datos</strong>: Ingresa la información del prospecto:
              <ul className="list-disc list-inside ml-8 mt-1 space-y-1">
                <li>`Nombre`: "Ana García"</li>
                <li>`Email`: "ana.garcia@example.com"</li>
                <li>`Teléfono`: "55-1234-5678"</li>
                <li>`Fuente`: "Web"</li>
                <li>`Estatus`: "NUEVO" (predeterminado)</li>
                <li>`Notas`: "Interesada en seguro de auto, rellenó formulario web."</li>
                <li>`Agente Responsable`: (Automáticamente asignado a Juan, o asignado por un ADMIN si aplica).</li>
              </ul>
            </li>
            <li><strong>Resultado</strong>: Se crea una tarjeta para Ana en la columna "NUEVO" del Pipeline.</li>
          </ul>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">Paso 2: Contacto Inicial y Calificación</h3>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Acción</strong>: Juan decide contactar a Ana. Va a <strong>Tareas</strong> y hace clic en "Nueva Tarea".</li>
            <li><strong>Datos de Tarea</strong>:
              <ul className="list-disc list-inside ml-8 mt-1 space-y-1">
                <li>`Descripción`: "Llamada inicial para seguro de auto"</li>
                <li>`Asociar con`: Selecciona "Ana García" (el lead).</li>
                <li>`Tipo`: "LLAMADA"</li>
                <li>`Fecha de Vencimiento`: Hoy</li>
                <li>`Prioridad`: "ALTA"</li>
                <li>`Estatus`: "PENDIENTE" (predeterminado)</li>
                <li>`Agente Responsable`: (Automáticamente asignado a Juan).</li>
              </ul>
            </li>
            <li><strong>Resultado</strong>: La tarea aparece en el tablero de tareas de Juan en la columna "PENDIENTE".</li>
            <li><strong>Acción</strong>: Juan realiza la llamada. Ana está interesada y acepta una propuesta.</li>
            <li><strong>Acción en CRM</strong>: Juan arrastra el lead de "Ana García" a la columna <strong>"CONTACTADO"</strong> y luego a <strong>"CALIFICADO"</strong> en el Pipeline. Marca la tarea "Llamada inicial..." como "COMPLETADA" en el tablero de Tareas.</li>
          </ul>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">Paso 3: Envío de Propuesta y Negociación</h3>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Acción</strong>: Juan crea otra tarea para el seguimiento.</li>
            <li><strong>Datos de Tarea</strong>:
              <ul className="list-disc list-inside ml-8 mt-1 space-y-1">
                <li>`Descripción`: "Enviar propuesta de seguro de auto Premium"</li>
                <li>`Asociar con`: "Ana García" (el lead).</li>
                <li>`Tipo`: "EMAIL"</li>
                <li>`Fecha de Vencimiento`: Mañana</li>
                <li>`Prioridad`: "MEDIA"</li>
              </ul>
            </li>
            <li><strong>Resultado</strong>: Una nueva tarea aparece en la columna "PENDIENTE" de Juan.</li>
            <li><strong>Acción</strong>: Juan envía la propuesta por email. Ana responde con algunas preguntas y acepta las condiciones.</li>
            <li><strong>Acción en CRM</strong>: Juan marca la tarea "Enviar propuesta..." como "COMPLETADA". Decide que el lead está a punto de cerrarse y lo arrastra a la columna <strong>"GANADO"</strong> en el Pipeline.</li>
            <li><strong>Resultado automático</strong>: Al arrastrar a "GANADO", el sistema automáticamente:
              <ul className="list-disc list-inside ml-8 mt-1 space-y-1">
                <li>Crea un nuevo registro para "Ana García" en la sección <strong>Clientes</strong>.</li>
                <li>Transfiere el `agent_id` de Juan al nuevo cliente.</li>
              </ul>
            </li>
          </ul>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">Paso 4: Creación de la Póliza</h3>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Acción</strong>: Ahora que Ana es cliente, Juan va a la sección <strong>Pólizas</strong> y hace clic en "Crear Nueva Póliza".</li>
            <li><strong>Datos de Póliza</strong>:
              <ul className="list-disc list-inside ml-8 mt-1 space-y-1">
                <li>`Cliente`: Selecciona "Ana García".</li>
                <li>`Producto`: Selecciona "Seguro de Auto Premium" (un producto que un ADMIN previamente configuró en la sección de Productos).</li>
                <li>`Prima Total Anual`: Ingresa "$12,000".</li>
                <li>`Fecha de Emisión`: Hoy</li>
                <li>`Fecha de Vencimiento`: Hoy + 1 año (automáticamente sugerido).</li>
                <li>`Estatus`: "ACTIVA"</li>
                <li>`Agente Responsable`: (Automáticamente asignado a Juan, o asignado por un ADMIN si es necesario).</li>
              </ul>
            </li>
            <li><strong>Acción (opcional)</strong>: Juan adjunta el contrato firmado de la póliza en el modal de la póliza de Ana.</li>
            <li><strong>Resultado</strong>: La nueva póliza de Ana García se registra con éxito, calculando la comisión de Juan.</li>
          </ul>
        </article>

        <article className="space-y-1">
          <h3 className="text-xl font-medium text-text-primary">Paso 5: Seguimiento y Renovación</h3>
          <ul className="list-disc list-inside text-text-secondary ml-4 space-y-1">
            <li><strong>Acción</strong>: Un año después, Juan revisa el <strong>Dashboard</strong> o la sección de <strong>Reportes</strong>.</li>
            <li><strong>Resultado</strong>: En "Pólizas Próximas a Vencer" (en Reportes), ve la póliza de Ana García listada porque su fecha de vencimiento se acerca.</li>
            <li><strong>Acción</strong>: Juan crea una tarea para contactar a Ana para la renovación.</li>
            <li><strong>Resultado</strong>: Juan proactivamente gestiona la renovación, asegurando la retención del cliente.</li>
          </ul>
        </article>
      </section>

      <p className="text-text-secondary mt-8 border-t border-border pt-4">
        Este flujo demuestra cómo el SeguroCRM te ayuda a mantener un registro organizado de cada interacción, desde el primer interés hasta la gestión activa de las pólizas, asegurando que no se pierda ninguna oportunidad de negocio o seguimiento importante.
      </p>
    </div>
  );
};

export default Guide;
