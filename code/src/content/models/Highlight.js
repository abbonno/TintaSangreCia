import mongoose from 'mongoose';

const HighlightSchema = new mongoose.Schema({
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
  
  // Contenido destacado
  content: { type: String, required: true },
  
  // Ubicación exacta del highlight
  location: {
    type: { type: String, enum: ['chapter'], required: true },
    contentId: { type: String, required: true }, // chapter_002, etc.
    page: { type: Number },
    startPosition: { type: Number }, // Posición de inicio en el texto
    endPosition: { type: Number },   // Posición final en el texto
    startLine: { type: Number },     // Línea de inicio
    endLine: { type: Number }        // Línea final
  },
  
  // Metadatos
  tags: [String],
  isPrivate: { type: Boolean, default: true },
  isFavorite: { type: Boolean, default: false }
  
}, {
  timestamps: true
});

// Índices para optimizar consultas
HighlightSchema.index({ user: 1, book: 1 });
HighlightSchema.index({ book: 1, 'location.type': 1, 'location.contentId': 1 });
HighlightSchema.index({ user: 1, isFavorite: 1 });

export default mongoose.models.Highlight || mongoose.model('Highlight', HighlightSchema);
