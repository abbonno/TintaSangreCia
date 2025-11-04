import mongoose from 'mongoose';

const UserBookProgressSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  book: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  
  // Progreso de lectura
  progress: {
    currentPage: { type: Number, default: 1 },
    currentChapter: { type: String }, // ID del capítulo actual
    totalPagesRead: { type: Number, default: 0 },
    percentageComplete: { type: Number, default: 0 },
    lastReadAt: { type: Date, default: Date.now }
  },
  
  // Bookmarks/marcadores
  bookmarks: [{
    page: Number,
    chapterId: String,
    note: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Configuración de activación
  activationCode: { type: String }, // El código que usó para activar el libro
  activatedAt: { type: Date },
  isActive: { type: Boolean, default: false },
  
  // Estadísticas de interacción
  stats: {
    totalHighlights: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalDiaryEntries: { type: Number, default: 0 },
    totalReadTime: { type: Number, default: 0 }, // en minutos
    sessionsCount: { type: Number, default: 0 },
    averageSessionTime: { type: Number, default: 0 }
  },
  
  // Configuración de usuario para este libro
  preferences: {
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    theme: { type: String, enum: ['light', 'dark', 'sepia'], default: 'light' },
    highlightColor: { 
      type: String, 
      enum: ['yellow', 'green', 'blue', 'pink', 'orange'], 
      default: 'yellow' 
    }
  }
}, {
  timestamps: true
});

// Índice único para evitar duplicados usuario-libro
UserBookProgressSchema.index({ user: 1, book: 1 }, { unique: true });

// Métodos para actualizar progreso
UserBookProgressSchema.methods.updateProgress = function(page, chapterId = null) {
  this.progress.currentPage = page;
  if (chapterId) this.progress.currentChapter = chapterId;
  this.progress.lastReadAt = new Date();
  
  // Calcular porcentaje de progreso (esto sería más complejo en la realidad)
  // Por simplicidad, asumimos que hay 100 páginas totales
  this.progress.percentageComplete = Math.min((page / 100) * 100, 100);
  
  return this.save();
};

// Método para marcar contenido como completado
UserBookProgressSchema.methods.markContentComplete = function(type, contentId, readTime = 0) {
  const completedItem = {
    [`${type}Id`]: contentId,
    completedAt: new Date(),
    readTime
  };
  
  if (type === 'chapter') {
    this.completedContent.chapters.push(completedItem);
  }
  
  this.stats.totalReadTime += readTime;
  return this.save();
};

// Método para añadir bookmark
UserBookProgressSchema.methods.addBookmark = function(page, note = '', chapterId = null) {
  this.bookmarks.push({
    page,
    chapterId,
    note,
    createdAt: new Date()
  });
  return this.save();
};

export default mongoose.models.UserBookProgress || mongoose.model('UserBookProgress', UserBookProgressSchema);
