import mongoose from 'mongoose';

const DiarySchema = new mongoose.Schema({
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
  
  // Contenido del diario
  title: { type: String, required: true },
  content: { type: String, required: true }, // Podría ser Markdown para luego renderizarlo
  
  // Organización
  tags: [String],
  isPrivate: { type: Boolean, default: true },
  isFavorite: { type: Boolean, default: false },
  
  
}, {
  timestamps: true
});

// Índices para optimizar consultas
DiarySchema.index({ user: 1, book: 1 });
DiarySchema.index({ user: 1, createdAt: -1 });
DiarySchema.index({ user: 1, isFavorite: 1 });

export default mongoose.models.Diary || mongoose.model('Diary', DiarySchema);
