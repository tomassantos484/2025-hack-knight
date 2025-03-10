/**
 * Trash Scanner JavaScript Module
 * This module provides functionality to classify trash images using the Gemini AI API.
 */

// Configuration
const API_BASE_URL = 'https://ecovision-backend-production.up.railway.app'; // Railway deployment URL

// Category configuration
const categoryConfig = {
    'recycle': {
        icon: '♻️',
        class: 'result-recycle',
        title: 'Recyclable'
    },
    'compost': {
        icon: '🌱',
        class: 'result-compost',
        title: 'Compostable'
    },
    'landfill': {
        icon: '🗑️',
        class: 'result-landfill',
        title: 'Landfill Waste'
    },
    'unknown': {
        icon: '❓',
        class: '',
        title: 'Unknown'
    }
};

/**
 * Initialize the trash scanner functionality
 * @param {Object} options - Configuration options
 * @param {string} options.dropAreaId - ID of the drop area element
 * @param {string} options.fileInputId - ID of the file input element
 * @param {string} options.uploadButtonId - ID of the upload button element
 * @param {string} options.imagePreviewId - ID of the image preview element
 * @param {string} options.classifyButtonId - ID of the classify button element
 * @param {string} options.loadingIndicatorId - ID of the loading indicator element
 * @param {string} options.errorMessageId - ID of the error message element
 * @param {string} options.resultContainerId - ID of the result container element
 * @param {string} options.resultIconId - ID of the result icon element
 * @param {string} options.resultTitleId - ID of the result title element
 * @param {string} options.resultConfidenceId - ID of the result confidence element
 * @param {string} options.resultDetailsId - ID of the result details element
 * @param {string} options.tipsListId - ID of the tips list element
 */
function initTrashScanner(options) {
    // Get DOM elements
    const dropArea = document.getElementById(options.dropAreaId);
    const fileInput = document.getElementById(options.fileInputId);
    const uploadButton = document.getElementById(options.uploadButtonId);
    const imagePreview = document.getElementById(options.imagePreviewId);
    const classifyButton = document.getElementById(options.classifyButtonId);
    const loadingIndicator = document.getElementById(options.loadingIndicatorId);
    const errorMessage = document.getElementById(options.errorMessageId);
    const resultContainer = document.getElementById(options.resultContainerId);
    const resultIcon = document.getElementById(options.resultIconId);
    const resultTitle = document.getElementById(options.resultTitleId);
    const resultConfidence = document.getElementById(options.resultConfidenceId);
    const resultDetails = document.getElementById(options.resultDetailsId);
    const tipsList = document.getElementById(options.tipsListId);

    // Event listeners
    uploadButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    classifyButton.addEventListener('click', classifyImage);

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('dragover');
    }

    function unhighlight() {
        dropArea.classList.remove('dragover');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect({ target: fileInput });
        }
    }

    // Handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                classifyButton.style.display = 'block';
                classifyButton.disabled = false;
                
                // Hide previous results
                resultContainer.style.display = 'none';
                errorMessage.style.display = 'none';
            };
            
            reader.readAsDataURL(file);
        }
    }

    // Classify the image
    async function classifyImage() {
        if (!imagePreview.src) {
            showError('Please select an image first.');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        classifyButton.disabled = true;
        errorMessage.style.display = 'none';
        resultContainer.style.display = 'none';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/classify-trash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imagePreview.src
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            displayResult(data);
        } catch (error) {
            showError(`Classification failed: ${error.message}`);
        } finally {
            loadingIndicator.style.display = 'none';
            classifyButton.disabled = false;
        }
    }

    // Display the classification result
    function displayResult(data) {
        const category = data.category || 'unknown';
        const config = categoryConfig[category];
        
        // Set result container class
        resultContainer.className = 'result-container';
        if (config.class) {
            resultContainer.classList.add(config.class);
        }
        
        // Set icon and title
        resultIcon.textContent = config.icon;
        resultTitle.textContent = config.title;
        
        // Set confidence
        resultConfidence.textContent = `Confidence: ${data.confidence || 0}%`;
        
        // Set details
        resultDetails.textContent = data.details || 'No details available.';
        
        // Set tips
        tipsList.innerHTML = '';
        if (data.tips && data.tips.length > 0) {
            data.tips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                tipsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No tips available.';
            tipsList.appendChild(li);
        }
        
        // Show result container
        resultContainer.style.display = 'block';
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        loadingIndicator.style.display = 'none';
    }
}

// Export the initialization function
window.initTrashScanner = initTrashScanner; 