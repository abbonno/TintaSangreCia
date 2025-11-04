import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String }, // URL de la imagen de portada
  isbn: { type: String, unique: true },
  
  // Contenido del libro organizado
  content: {
    chapters: [{
      id: { type: String, required: true }, // ID único para cada capítulo
      title: { type: String, required: true },
      content: { type: String, required: true },
      order: { type: Number, required: true },
      pageNumber: { type: Number },
      isPublic: { type: Boolean, default: false }
    }],
    resources: [{
      title: String,
      type: { type: String, enum: ['pdf', 'audio', 'video', 'image'] },
      url: String,
      description: String,
      isPublic: { type: Boolean, default: false }
    }]
  },
  
  // Configuración de acceso
  accessType: { 
    type: String, 
    enum: ['free', 'activation_code', 'purchase_required'], 
    default: 'activation_code' 
  },
  
  // Códigos de activación para el libro
  activationCodes: [{
    code: { type: String, required: true, unique: true },
    isUsed: { type: Boolean, default: false },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: Date,
    expiresAt: Date,
    batchId: String // Para agrupar códigos generados juntos
  }],
  
  isActive: { type: Boolean, default: true },
  
  // Estadísticas del libro
  stats: {
    totalUsers: { type: Number, default: 0 },
    totalHighlights: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalDiaryEntries: { type: Number, default: 0 },
    averageProgress: { type: Number, default: 0 } // % promedio de progreso de los usuarios
  }
}, {
  timestamps: true
});

// Índices para optimizar búsquedas
BookSchema.index({ 'content.poems.id': 1 });
BookSchema.index({ 'content.chapters.id': 1 });
BookSchema.index({ 'activationCodes.code': 1 });

// Método para generar código de activación
BookSchema.methods.generateActivationCode = function() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase() + 
               Math.random().toString(36).substring(2, 8).toUpperCase();
  return code;
};

// Método para verificar si un usuario tiene acceso
BookSchema.methods.hasUserAccess = function(userId) {
  return this.activationCodes.some(code => 
    code.isUsed && 
    code.usedBy && 
    code.usedBy.toString() === userId.toString()
  );
};

export default mongoose.models.Book || mongoose.model('Book', BookSchema);
