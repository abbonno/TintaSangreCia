// Texto del libro (marcado personalizado)
const rawText = `
[h1]Capítulo 1[/h1]

Este es un párrafo de prueba. [b]Este texto es importante[/b] y 
[r]este texto es rojo[/r]. Vamos a añadir mucho texto para simular un libro
y ver cómo funciona la paginación automática. Este es un párrafo de prueba normal sin etiquetas especiales.

Los personajes principales comienzan a desarrollarse en esta parte de la historia. La trama se vuelve más compleja y los conflictos internos de cada personaje salen a la luz.

[h1]Capítulo 2[/h1]
Más texto para llenar el libro y ver cómo funciona la paginación en dos columnas.
Este capítulo contiene información importante sobre el desarrollo de la historia.
Los personajes principales comienzan a mostrar su verdadera naturaleza y sus motivaciones más profundas.

En este punto de la narrativa, los eventos se aceleran considerablemente. Las decisiones tomadas anteriormente comienzan a tener consecuencias inesperadas para todos los involucrados.

[h1]Capítulo 3[/h1]
En este capítulo la trama se complica. [b]Los conflictos principales[/b] emergen
y los personajes deben tomar [r]decisiones cruciales[/r] que afectarán 
el desarrollo posterior de la historia. Aquí vemos cómo cada personaje reacciona de manera diferente ante la adversidad.

El ambiente se vuelve más tenso y la incertidumbre reina en cada página. Los lectores comenzarán a sentir la presión que experimentan los protagonistas.

[h1]Capítulo 4[/h1]
El desarrollo continúa con nuevos elementos narrativos que enriquecen
la experiencia del lector. La tensión aumenta gradualmente y nuevos personajes secundarios aparecen para complicar aún más la situación.

Los diálogos se vuelven más intensos y revelan aspectos ocultos de la personalidad de cada personaje. Las alianzas comienzan a formarse y romperse.

[h1]Capítulo 5[/h1]
Los eventos se aceleran y los personajes enfrentan sus mayores desafíos.
[b]La resolución[/b] del conflicto principal comienza a tomar forma, aunque aún quedan muchas incógnitas por resolver.

Este capítulo marca un punto de inflexión en la narrativa donde todas las tramas secundarias comienzan a converger hacia el clímax final.
`;

class BookPaginator {
  constructor() {
    this.currentPage = 1;
    this.totalPages = 1;
    this.pages = [];
    this.highlights = JSON.parse(localStorage.getItem('bookHighlights') || '[]');
    this.selectedRange = null; // Para guardar la selección exacta
    
    this.container = document.getElementById('bookContainer');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.pageInfo = document.getElementById('pageInfo');
    
    this.init();
  }

  // Función que convierte nuestro marcado a HTML
  renderCustomMarkup(text) {
    return text
      .trim()
      .replace(/\[h1\](.*?)\[\/h1\]/gs, '<h1>$1</h1>')
      .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>')
      .replace(/\[r\](.*?)\[\/r\]/gs, '<span style="color:red">$1</span>')
      .replace(/\n\s*\n/g, '\n\n') // Mantener saltos dobles
      .split('\n\n') // Dividir por párrafos
      .filter(p => p.trim()) // Eliminar párrafos vacíos
      .map(paragraph => {
        paragraph = paragraph.trim();
        // Si ya es un título, devolverlo tal como está
        if (paragraph.startsWith('<h1>')) {
          return paragraph;
        }
        // Si no, envolverlo en párrafo
        return `<p>${paragraph.replace(/\n/g, ' ')}</p>`;
      })
      .join('');
  }

  // Divide el contenido en páginas basándose en la altura real del contenedor
  createPages() {
    if (!this.container) return;
    
    const processedText = this.renderCustomMarkup(rawText);
    
    // Crear elementos individuales
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedText;
    const elements = Array.from(tempDiv.children);
    
    this.pages = [];
    let currentPageElements = [];
    
    // Medir la altura disponible
    const containerHeight = this.container.clientHeight;
    const testContainer = this.createTestContainer();
    
    elements.forEach((element, index) => {
      const isChapter = element.tagName === 'H1';
      
      // Si es un nuevo capítulo y ya tenemos elementos, forzar nueva página
      if (isChapter && currentPageElements.length > 0) {
        this.finalizePage(currentPageElements, testContainer);
        currentPageElements = [element];
      } else {
        // Probar si cabe en la página actual
        const testElements = [...currentPageElements, element];
        const testHeight = this.measureHeight(testElements, testContainer);
        
        // Si excede la altura disponible, finalizar página actual
        if (testHeight > containerHeight && currentPageElements.length > 0) {
          this.finalizePage(currentPageElements, testContainer);
          
          // Verificar si el elemento individual es demasiado alto
          const elementHeight = this.measureHeight([element], testContainer);
          if (elementHeight > containerHeight && element.tagName === 'P') {
            // Dividir párrafo largo
            const splitElements = this.splitElementByHeight(element, containerHeight, testContainer);
            splitElements.forEach(splitEl => {
              this.finalizePage([splitEl], testContainer);
            });
            currentPageElements = [];
          } else {
            currentPageElements = [element];
          }
        } else {
          currentPageElements.push(element);
        }
      }
    });
    
    // Finalizar última página
    if (currentPageElements.length > 0) {
      this.finalizePage(currentPageElements, testContainer);
    }
    
    // Limpiar contenedor de prueba
    document.body.removeChild(testContainer);
    
    this.totalPages = Math.max(this.pages.length, 1);
  }

  // Crea un contenedor invisible para medir alturas
  createTestContainer() {
    const testContainer = document.createElement('div');
    testContainer.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: ${this.container.clientWidth}px;
      column-count: 2;
      column-gap: 60px;
      column-fill: balance;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      padding: 40px;
      box-sizing: border-box;
      visibility: hidden;
    `;
    document.body.appendChild(testContainer);
    return testContainer;
  }

  // Mide la altura de un conjunto de elementos
  measureHeight(elements, testContainer) {
    testContainer.innerHTML = elements.map(el => el.outerHTML).join('');
    return testContainer.scrollHeight;
  }

  // Finaliza una página con los elementos actuales
  finalizePage(elements, testContainer) {
    if (elements.length === 0) return;
    const pageContent = elements.map(el => el.outerHTML).join('');
    this.pages.push(pageContent);
  }

  // Divide un elemento que es demasiado alto
  splitElementByHeight(element, maxHeight, testContainer) {
    if (element.tagName !== 'P') return [element];
    
    const text = element.textContent;
    const words = text.split(/\s+/);
    const splitElements = [];
    
    let currentWords = [];
    
    for (let i = 0; i < words.length; i++) {
      currentWords.push(words[i]);
      
      // Crear elemento de prueba
      const testElement = element.cloneNode(true);
      testElement.textContent = currentWords.join(' ');
      
      const testHeight = this.measureHeight([testElement], testContainer);
      
      if (testHeight > maxHeight && currentWords.length > 1) {
        // Quitar la última palabra y crear elemento
        currentWords.pop();
        const finalElement = element.cloneNode(true);
        finalElement.textContent = currentWords.join(' ');
        splitElements.push(finalElement);
        
        // Empezar nueva página con la palabra que no cabía
        currentWords = [words[i]];
      }
    }
    
    // Agregar las palabras restantes
    if (currentWords.length > 0) {
      const finalElement = element.cloneNode(true);
      finalElement.textContent = currentWords.join(' ');
      splitElements.push(finalElement);
    }
    
    return splitElements;
  }

  // Divide párrafos largos manteniendo formato
  splitLongParagraph(element) {
    const words = element.textContent.trim().split(/\s+/);
    const pages = [];
    
    for (let i = 0; i < words.length; i += this.wordsPerPage) {
      const pageWords = words.slice(i, i + this.wordsPerPage);
      const pageText = pageWords.join(' ');
      
      // Recrear el HTML manteniendo el formato interno
      let pageHTML = element.innerHTML;
      const originalText = element.textContent;
      
      // Reemplazar el contenido manteniendo las etiquetas
      if (pageHTML.includes('<strong>') || pageHTML.includes('<span')) {
        // Para contenido con formato, usar aproximación
        const ratio = pageText.length / originalText.length;
        const cutPoint = Math.floor(pageHTML.length * ratio);
        pageHTML = pageHTML.substring(0, cutPoint) + '...';
      } else {
        pageHTML = pageText;
      }
      
      pages.push(`<p>${pageHTML}</p>`);
    }
    
    return pages;
  }

  // Renderiza la página actual con highlights
  renderPage() {
    if (!this.container || !this.pages.length) return;
    
    this.container.classList.add('transitioning');
    
    setTimeout(() => {
      let pageContent = this.pages[this.currentPage - 1] || '';
      
      // Aplicar highlights usando el nuevo sistema
      this.container.innerHTML = pageContent;
      this.applyHighlightsToCurrentPage();
      
      this.updateControls();
      this.setupHighlightHandlers();
      
      this.container.classList.remove('transitioning');
    }, 100);
  }

  // Aplica highlights a la página actual
  applyHighlightsToCurrentPage() {
    this.highlights.forEach(highlight => {
      if (highlight.page === this.currentPage) {
        this.applyHighlightByPosition(highlight);
      }
    });
  }

  // Aplica los highlights guardados al contenido
  applyHighlights(content) {
    this.highlights.forEach(highlight => {
      if (highlight.page === this.currentPage) {
        const regex = new RegExp(`(${this.escapeRegex(highlight.text)})`, 'gi');
        content = content.replace(regex, '<mark class="highlight" data-highlight-id="' + highlight.id + '">$1</mark>');
      }
    });
    return content;
  }

  // Escapa caracteres especiales para regex
  escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  // Configura los manejadores para highlighting
  setupHighlightHandlers() {
    // Botón para highlight
    if (!document.getElementById('highlightBtn')) {
      const highlightBtn = document.createElement('button');
      highlightBtn.id = 'highlightBtn';
      highlightBtn.textContent = '📍 Resaltar';
      highlightBtn.className = 'highlight-btn';
      highlightBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f39c12;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
      `;
      document.body.appendChild(highlightBtn);
      
      highlightBtn.addEventListener('click', () => this.highlightSelection());
    }

    // Manejar clicks en highlights existentes para eliminarlos
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('highlight')) {
        const highlightId = e.target.dataset.highlightId;
        this.removeHighlight(highlightId);
      }
    });
  }

  // Resalta el texto seleccionado de forma precisa
  highlightSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();
      
      if (selectedText.length > 0) {
        // Verificar que la selección esté dentro del contenedor del libro
        if (!this.container.contains(range.commonAncestorContainer) && 
            !this.container.contains(range.commonAncestorContainer.parentNode)) {
          alert('Por favor, selecciona texto dentro del libro');
          return;
        }
        
        // Crear ID único para el highlight
        const highlightId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Obtener información precisa de la posición
        const rangeInfo = this.getRangeInfo(range);
        
        // Guardar highlight con información de posición precisa
        const highlight = {
          id: highlightId,
          page: this.currentPage,
          text: selectedText,
          startContainer: rangeInfo.startContainer,
          startOffset: rangeInfo.startOffset,
          endContainer: rangeInfo.endContainer,
          endOffset: rangeInfo.endOffset,
          timestamp: Date.now()
        };
        
        this.highlights.push(highlight);
        this.saveHighlights();
        
        // Aplicar highlight visual
        try {
          const mark = document.createElement('mark');
          mark.className = 'highlight';
          mark.dataset.highlightId = highlightId;
          mark.style.cssText = 'background-color: yellow; cursor: pointer; padding: 2px;';
          
          range.surroundContents(mark);
          selection.removeAllRanges();
        } catch (e) {
          // Si falla el wrapping directo, re-renderizar la página
          this.renderPage();
        }
      }
    } else {
      alert('Por favor, selecciona texto para resaltar');
    }
  }

  // Obtiene información precisa del rango seleccionado
  getRangeInfo(range) {
    return {
      startContainer: this.getNodePath(range.startContainer),
      startOffset: range.startOffset,
      endContainer: this.getNodePath(range.endContainer),
      endOffset: range.endOffset
    };
  }

  // Obtiene el path del nodo para identificarlo de forma única
  getNodePath(node) {
    const path = [];
    let current = node;
    
    while (current && current !== this.container) {
      if (current.nodeType === Node.TEXT_NODE) {
        // Para nodos de texto, obtener el índice entre sus hermanos de texto
        const parent = current.parentNode;
        const textNodes = Array.from(parent.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
        const index = textNodes.indexOf(current);
        path.unshift({type: 'text', index: index, parentTag: parent.tagName});
      } else if (current.nodeType === Node.ELEMENT_NODE) {
        const parent = current.parentNode;
        if (parent) {
          const siblings = Array.from(parent.children).filter(el => el.tagName === current.tagName);
          const index = siblings.indexOf(current);
          path.unshift({type: 'element', tag: current.tagName, index: index});
        }
      }
      current = current.parentNode;
    }
    
    return path;
  }

  // Aplica los highlights guardados de forma precisa
  applyHighlights(content) {
    // En lugar de usar regex, vamos a re-renderizar y luego aplicar highlights
    this.container.innerHTML = content;
    
    // Aplicar cada highlight usando su información de posición
    this.highlights.forEach(highlight => {
      if (highlight.page === this.currentPage) {
        this.applyHighlightByPosition(highlight);
      }
    });
    
    return this.container.innerHTML;
  }

  // Aplica un highlight específico usando información de posición
  applyHighlightByPosition(highlight) {
    try {
      // Si tenemos información de posición precisa, usarla
      if (highlight.startContainer && highlight.endContainer) {
        const startNode = this.findNodeByPath(highlight.startContainer);
        const endNode = this.findNodeByPath(highlight.endContainer);
        
        if (startNode && endNode) {
          const range = document.createRange();
          range.setStart(startNode, highlight.startOffset);
          range.setEnd(endNode, highlight.endOffset);
          
          const mark = document.createElement('mark');
          mark.className = 'highlight';
          mark.dataset.highlightId = highlight.id;
          mark.style.cssText = 'background-color: yellow; cursor: pointer; padding: 2px;';
          
          range.surroundContents(mark);
          return;
        }
      }
      
      // Fallback: buscar por texto (menos preciso)
      this.applyHighlightByText(highlight);
      
    } catch (e) {
      console.warn('No se pudo aplicar highlight:', e);
      // Fallback silencioso
      this.applyHighlightByText(highlight);
    }
  }

  // Fallback: aplicar highlight buscando por texto
  applyHighlightByText(highlight) {
    const walker = document.createTreeWalker(
      this.container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let textNode;
    while (textNode = walker.nextNode()) {
      const content = textNode.textContent;
      const index = content.indexOf(highlight.text);
      
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(textNode, index);
        range.setEnd(textNode, index + highlight.text.length);
        
        const mark = document.createElement('mark');
        mark.className = 'highlight';
        mark.dataset.highlightId = highlight.id;
        mark.style.cssText = 'background-color: yellow; cursor: pointer; padding: 2px;';
        
        try {
          range.surroundContents(mark);
          break; // Solo aplicar al primer match para evitar duplicados
        } catch (e) {
          continue;
        }
      }
    }
  }

  // Encuentra un nodo usando su path
  findNodeByPath(path) {
    let current = this.container;
    
    for (const step of path) {
      if (step.type === 'element') {
        const elements = Array.from(current.children).filter(el => el.tagName === step.tag);
        if (elements[step.index]) {
          current = elements[step.index];
        } else {
          return null;
        }
      } else if (step.type === 'text') {
        const textNodes = Array.from(current.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
        if (textNodes[step.index]) {
          return textNodes[step.index];
        } else {
          return null;
        }
      }
    }
    
    return current;
  }

  // Elimina un highlight
  removeHighlight(highlightId) {
    this.highlights = this.highlights.filter(h => h.id !== highlightId);
    this.saveHighlights();
    this.renderPage(); // Re-renderizar para eliminar visualmente
  }

  // Guarda highlights en localStorage
  saveHighlights() {
    localStorage.setItem('bookHighlights', JSON.stringify(this.highlights));
  }

  // Actualiza controles de navegación
  updateControls() {
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentPage === 1;
    }
    
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentPage === this.totalPages;
    }
    
    if (this.pageInfo) {
      this.pageInfo.textContent = `Página ${this.currentPage} de ${this.totalPages}`;
    }
  }

  // Navegación
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderPage();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderPage();
    }
  }

  goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.renderPage();
    }
  }

  // Inicializar
  init() {
    this.createPages();
    this.renderPage();
    
    // Event listeners
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.previousPage());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextPage());
    }
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.previousPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextPage();
          break;
        case 'Home':
          e.preventDefault();
          this.goToPage(1);
          break;
        case 'End':
          e.preventDefault();
          this.goToPage(this.totalPages);
          break;
      }
    });
    
    // Re-calcular en resize
    window.addEventListener('resize', () => {
      const currentPageNum = this.currentPage;
      this.createPages();
      this.goToPage(Math.min(currentPageNum, this.totalPages));
    });
  }
}

// Inicializar
window.addEventListener('DOMContentLoaded', () => {
  new BookPaginator();
});