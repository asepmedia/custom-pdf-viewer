class PdfViewer {
  pageNumber = 1
  totalPage = 0
  pdfPath = null
  scale = 1.5
  canvas = null
  context = null
  viewport = {}
  element = {
    pageNum: null,
    pageCount: 0,
    paging: document.getElementById("paging")
  }
  eventBus = new pdfjsViewer.EventBus();

  constructor(data = {}) {
    this.pdfPath = data.pdfPath
    this.scale = data.scale || 1

    this.init()
  }

  init() {
    this.renderPdf()
    this.renderMetaPdf()
    this.addEventListenerButton()
    this.addEventListenerPagination()
  }

  renderPdf() {
    let loadingTask = pdfjsLib.getDocument(this.pdfPath);
    loadingTask.promise.then((doc) => {
      this.totalPage = doc.numPages
      // for (var i = 1; i <= this.totalPage; i++) {
      //   pdf.getPage(i).then((page) => {        
      //     this.viewport = page.getViewport({scale: this.scale});

      //     this.canvas = document.getElementById('the-canvas');
      //     this.context = this.canvas.getContext('2d');
      //     this.canvas.height = this.viewport.height;
      //     this.canvas.width = this.viewport.width;

      //     let renderContext = {
      //       canvasContext: this.context,
      //       viewport: this.viewport
      //     };

      //     let renderTask = page.render(renderContext);
      //     renderTask.promise.then(function () {
      //       console.log('Page rendered');
      //     });
      //   });
      // }

      var promise = Promise.resolve();

      for (var i = 1; i <= doc.numPages; i++) {
        promise = promise.then(
          ((pageNum) => {
            return doc.getPage(pageNum).then((pdfPage) => {
              var container = document.getElementById('the-canvas')
              var viewport = pdfPage.getViewport({scale : this.scale});

              var pdfPageView = new pdfjsViewer.PDFPageView({
                container: container,
                id: pageNum,
                scale: this.scale,
                defaultViewport: pdfPage.getViewport({ scale: this.scale }),
                eventBus: this.eventBus,
                annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
                renderInteractiveForms: true,
              });

              pdfPageView.setPdfPage(pdfPage);
              return pdfPageView.draw();
            });
          }).bind(null, i)
        );
      }
    }, function (reason) {
      console.error(reason);
    });
  }

  renderMetaPdf() {
    this.setPageNum()
  }

  setPageNum() {
    this.hasDisabledButtonPrev()
    this.element.paging.value = this.pageNumber
    this.hasDisabledButtonNext()
  }

  hasDisabledButtonPrev() {
    document.getElementById('prev').disabled = !(this.pageNumber >= 2)
  }

  toggleDisableBtn(el, value) {
    document.getElementById(el).disabled = value
  }

  hasDisabledButtonNext() {
    if(this.totalPage <= 0) return
    document.getElementById('next').disabled = (this.pageNumber >= this.totalPage)
  }

  onPrevPage() {
    console.log(this.pageNumber)
    if (this.pageNumber == 1) {
      return;
    }
    this.pageNumber--
  }

  onNextPage() {
    if (this.pageNumber >= this.totalPage) {
      return;
    }
    
    this.pageNumber++
  }

  scrollIntoView() {
    document.querySelector(`[data-page-number='${this.pageNumber}']`).scrollIntoView({behavior: 'smooth'});
  }

  setZoom(zoom,el) {
      
    let transformOrigin = [0,0];
    el = el || instance.getContainer();
    var p = ["webkit", "moz", "ms", "o"],
          s = "scale(" + zoom + ")",
          oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";

    for (var i = 0; i < p.length; i++) {
        el.style[p[i] + "Transform"] = s;
        el.style[p[i] + "TransformOrigin"] = oString;
    }

    el.style["transform"] = s;
    el.style["transformOrigin"] = oString;
    
}
  
  addEventListenerButton() {
    var elNext = document.getElementById('next');
    elNext.addEventListener('click', (e) => {
      this.onNextPage()
      this.setPageNum()
      this.scrollIntoView()
    });

    var elPrev = document.getElementById('prev');
    elPrev.addEventListener('click', (e) => {
      this.onPrevPage()
      this.setPageNum()
      this.scrollIntoView()
    });

    // var elZoomIn = document.getElementById('zoomin');
    // elZoomIn.addEventListener('click', (e) => {
    //   document.getElementById('the-canvas').innerHTML = ''
    //   this.scale += 0.3
    //   this.renderPdf()
    // });

    // var elZoomOut = document.getElementById('zoomout');
    // elZoomOut.addEventListener('click', (e) => {
    //   this.scale -= 0.3
    //   this.scale,document.getElementById('the-canvas').innerHTML = ''
    //   this.renderPdf()
    // });
  }

  addEventListenerPagination() {
    document.addEventListener('scroll', (e) => {
      let height = document.getElementById('the-canvas').clientHeight
      console.log(height)
      this.pageNumber = Math.ceil(window.pageYOffset / (height/ this.totalPage))
      this.setPageNum()
    })
  }
}