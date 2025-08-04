import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
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
  
  // Contenido del comentario
  content: { type: String, required: true },
  
  // Referencia específica del contenido comentado
  reference: {
    type: { type: String, enum: ['highlight'], required: true },
    contentId: { type: String }, // chapter_002, etc.
    highlightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Highlight', required: true}, // ID del highlight comentado
    page: { type: Number },
    line: { type: Number },
  },
  
  // Metadatos
  tags: [String],
  isPrivate: { type: Boolean, default: true },
  
  // Para futuras funcionalidades
  isFavorite: { type: Boolean, default: false },
  
}, {
  timestamps: true
});

// Índices para optimizar consultas
CommentSchema.index({ user: 1, book: 1 });
CommentSchema.index({ book: 1, 'reference.type': 1, 'reference.contentId': 1 });
CommentSchema.index({ user: 1, isFavorite: 1 });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
