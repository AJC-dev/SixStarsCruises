export const config = {
    recaptchaSiteKey: '', // Fetched from server
    pixabayApiKey: '', // Fetched from server
    minImageDimension: 800,
    printDPI: 300,
    a5WidthMM: 210,
    a5HeightMM: 148,
    handleRadius: 8,
    maxFileSizeMB: 4
};

export const appState = { 
    uploadedImage: null,
    imageSrcForResend: null, // Stores the original src for the "Send Again" feature
    imageOffsetX: 0,
    imageOffsetY: 0,
    imageZoom: 1.0,
    messagePlaceholderInterval: null,
    isPortrait: false,
    frontText: {
        text: '',
        x: null,
        y: null,
        font: "'Dancing Script', cursive",
        size: 32,
        width: 200, 
        color: '#FFFFFF',
        rotation: 0
    }
};

export const dom = {
    accordionHeaders: document.querySelectorAll('.accordion-header'),
    imageUploader: document.getElementById('image-uploader'),
    imagePlaceholder: document.getElementById('image-placeholder'),
    previewContainer: document.getElementById('preview-container'),
    imageWarning: document.getElementById('image-warning'),
    fileSizeWarning: document.getElementById('file-size-warning'),
    imageControls: document.getElementById('image-controls'),
    deleteImageBtn: document.getElementById('delete-image-btn'),
    zoomControls: document.getElementById('zoom-controls'),
    zoomInBtn: document.getElementById('zoom-in-btn'),
    zoomOutBtn: document.getElementById('zoom-out-btn'),
    previewCanvas: {
        el: document.getElementById('preview-canvas'),
    },
    textAccordion: {
        header: document.getElementById('text-accordion-header'),
        content: document.getElementById('text-accordion-content')
    },
    frontText: {
        input: document.getElementById('front-text-input'),
        fontSelect: document.getElementById('front-font-select'),
        colorPicker: document.getElementById('front-color-picker'),
        profanityWarning: document.getElementById('front-text-profanity-warning'),
    },
    textInput: document.getElementById('text-input'),
    fontSelect: document.getElementById('font-select'),
    colorPicker: document.getElementById('color-picker'),
    fontSizeSlider: document.getElementById('font-size-slider'),
    fontSizeValue: document.getElementById('font-size-value'),
    fontWeightSlider: document.getElementById('font-weight-slider'),
    fontWeightValue: document.getElementById('font-weight-value'),
    messageWarning: document.getElementById('message-warning'),
    messageProfanityWarning: document.getElementById('message-profanity-warning'),
    addressInputs: { name: document.getElementById('address-name'), line1: document.getElementById('address-line1'), line2: document.getElementById('address-line2'), city: document.getElementById('address-city'), postcode: document.getElementById('address-postcode'), country: document.getElementById('address-country') },
    finalPreviewFrontContainer: document.getElementById('final-preview-front-container'),
    finalPreviewFront: document.getElementById('final-preview-front'),
    finalPreviewBack: document.getElementById('final-preview-back'),
    sendPostcardBtn: document.getElementById('send-postcard-btn'),
    sender: { modal: document.getElementById('sender-modal'), nameInput: document.getElementById('sender-name'), emailInput: document.getElementById('sender-email'), sendBtn: document.getElementById('final-send-btn'), closeBtn: document.getElementById('close-sender-modal-btn'), recaptchaContainer: document.getElementById('recaptcha-container')},
    search: { modal: document.getElementById('search-modal'), showBtn: document.getElementById('show-search-modal-btn'), closeBtn: document.getElementById('close-search-modal-btn'), input: document.getElementById('search-input'), searchBtn: document.getElementById('search-btn'), resultsContainer: document.getElementById('search-results'), loader: document.getElementById('search-loader') },
    zoom: { modal: document.getElementById('zoom-modal'), image: document.getElementById('zoomed-image'), closeBtn: document.getElementById('close-zoom-modal-btn')}
};
