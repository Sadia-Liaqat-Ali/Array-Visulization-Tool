document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const directModeBtn = document.getElementById('directMode');
    const stepModeBtn = document.getElementById('stepMode');
    const arraySizeInput = document.getElementById('arraySize');
    const createArrayBtn = document.getElementById('createArray');
    const arrayValueInput = document.getElementById('arrayValue');
    const arrayIndexInput = document.getElementById('arrayIndex');
    const insertElementBtn = document.getElementById('insertElement');
    const updateElementBtn = document.getElementById('updateElement');
    const deleteElementBtn = document.getElementById('deleteElement');
    const operationSelect = document.getElementById('operationSelect');
    const searchValueInput = document.getElementById('searchValue');
    const executeOperationBtn = document.getElementById('executeOperation');
    const playPauseBtn = document.getElementById('playPause');
    const stopBtn = document.getElementById('stop');
    const rewindBtn = document.getElementById('rewind');
    const animationSpeedInput = document.getElementById('animationSpeed');
    const codeContent = document.getElementById('codeContent');
    const visualContent = document.getElementById('visualContent');
    const stepControls = document.getElementById('stepControls');
    const prevStepBtn = document.getElementById('prevStep');
    const nextStepBtn = document.getElementById('nextStep');
    const stepIndicator = document.getElementById('stepIndicator');
    const notification = document.getElementById('notification');

    // State variables
    let array = [];
    let currentMode = 'direct'; // 'direct' or 'step'
    let animationSpeed = 500;
    let isPlaying = false;
    let currentOperation = null;
    let currentStep = 0;
    let totalSteps = 0;
    let animationTimer = null;
    let operationSteps = [];

    // Code templates
    const codeTemplates = {
        createArray: `// Create an array of size n
int n = {size};
int arr[n];

// Initialize array with random values
for (int i = 0; i < n; i++) {
    arr[i] = rand() % 100;
}`,
        insertElement: `// Insert element at specific index
int value = {value};
int index = {index};

// Shift elements to the right
for (int i = n; i > index; i--) {
    arr[i] = arr[i-1];
}

// Insert the new value
arr[index] = value;
n++;`,
        updateElement: `// Update element at specific index
int value = {value};
int index = {index};

// Update the value at the index
arr[index] = value;`,
        deleteElement: `// Delete element at specific index
int index = {index};

// Shift elements to the left
for (int i = index; i < n-1; i++) {
    arr[i] = arr[i+1];
}

n--;`,
        linearSearch: `// Linear Search
int value = {value};
int foundIndex = -1;

for (int i = 0; i < n; i++) {
    if (arr[i] == value) {
        foundIndex = i;
        break;
    }
}

if (foundIndex != -1) {
    cout << "Element found at index: " << foundIndex;
} else {
    cout << "Element not found";
}`,
        binarySearch: `// Binary Search (requires sorted array)
int value = {value};
int left = 0;
int right = n-1;
int foundIndex = -1;

while (left <= right) {
    int mid = left + (right - left) / 2;
    
    if (arr[mid] == value) {
        foundIndex = mid;
        break;
    } else if (arr[mid] < value) {
        left = mid + 1;
    } else {
        right = mid - 1;
    }
}

if (foundIndex != -1) {
    cout << "Element found at index: " << foundIndex;
} else {
    cout << "Element not found";
}`,
        bubbleSort: `// Bubble Sort
for (int i = 0; i < n-1; i++) {
    for (int j = 0; j < n-i-1; j++) {
        if (arr[j] > arr[j+1]) {
            // Swap elements
            int temp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = temp;
        }
    }
}`
    };

    // Event Listeners
    directModeBtn.addEventListener('click', () => setMode('direct'));
    stepModeBtn.addEventListener('click', () => setMode('step'));
    createArrayBtn.addEventListener('click', createArray);
    insertElementBtn.addEventListener('click', () => modifyArray('insert'));
    updateElementBtn.addEventListener('click', () => modifyArray('update'));
    deleteElementBtn.addEventListener('click', () => modifyArray('delete'));
    executeOperationBtn.addEventListener('click', executeOperation);
    playPauseBtn.addEventListener('click', togglePlayPause);
    stopBtn.addEventListener('click', stopAnimation);
    rewindBtn.addEventListener('click', rewindAnimation);
    animationSpeedInput.addEventListener('input', updateAnimationSpeed);
    prevStepBtn.addEventListener('click', () => navigateStep(-1));
    nextStepBtn.addEventListener('click', () => navigateStep(1));

    // Functions
    function setMode(mode) {
        currentMode = mode;
        
        if (mode === 'direct') {
            directModeBtn.classList.add('active');
            stepModeBtn.classList.remove('active');
            stepControls.style.display = 'none';
        } else {
            stepModeBtn.classList.add('active');
            directModeBtn.classList.remove('active');
            stepControls.style.display = 'flex';
        }
    }

    function createArray() {
        const size = parseInt(arraySizeInput.value);
        
        if (size < 1 || size > 20) {
            showNotification('Array size must be between 1 and 20', 'error');
            return;
        }
        
        array = [];
        for (let i = 0; i < size; i++) {
            array.push(Math.floor(Math.random() * 100));
        }
        
        displayCode('createArray', { size });
        renderArray();
        showNotification('Array created successfully', 'success');
    }

    function modifyArray(operation) {
        if (array.length === 0) {
            showNotification('Please create an array first', 'error');
            return;
        }
        
        const value = parseInt(arrayValueInput.value);
        const index = parseInt(arrayIndexInput.value);
        
        if (index < 0 || index >= array.length) {
            showNotification('Index out of bounds', 'error');
            return;
        }
        
        displayCode(operation + 'Element', { value, index });
        
        if (currentMode === 'direct') {
            // Direct execution
            switch (operation) {
                case 'insert':
                    array.splice(index, 0, value);
                    break;
                case 'update':
                    array[index] = value;
                    break;
                case 'delete':
                    array.splice(index, 1);
                    break;
            }
            renderArray();
            showNotification(`${operation.charAt(0).toUpperCase() + operation.slice(1)} operation completed`, 'success');
        } else {
            // Step execution
            prepareStepExecution(operation, { value, index });
        }
    }

    function executeOperation() {
        const operation = operationSelect.value;
        
        if (!operation) {
            showNotification('Please select an operation', 'error');
            return;
        }
        
        if (array.length === 0) {
            showNotification('Please create an array first', 'error');
            return;
        }
        
        const searchValue = parseInt(searchValueInput.value);
        
        displayCode(operation, { value: searchValue });
        
        if (currentMode === 'direct') {
            // Direct execution with animation
            currentOperation = operation;
            resetAnimationControls();
            enableAnimationControls();
            
            switch (operation) {
                case 'linearSearch':
                    animateLinearSearch(searchValue);
                    break;
                case 'binarySearch':
                    animateBinarySearch(searchValue);
                    break;
                case 'bubbleSort':
                    animateBubbleSort();
                    break;
            }
        } else {
            // Step execution
            prepareStepExecution(operation, { value: searchValue });
        }
    }

    function prepareStepExecution(operation, params) {
        currentOperation = operation;
        operationSteps = [];
        currentStep = 0;
        
        // Create a copy of the array for step execution
        const arrayCopy = [...array];
        
        switch (operation) {
            case 'insertElement':
                operationSteps = generateInsertSteps(arrayCopy, params.value, params.index);
                break;
            case 'updateElement':
                operationSteps = generateUpdateSteps(arrayCopy, params.value, params.index);
                break;
            case 'deleteElement':
                operationSteps = generateDeleteSteps(arrayCopy, params.index);
                break;
            case 'linearSearch':
                operationSteps = generateLinearSearchSteps(arrayCopy, params.value);
                break;
            case 'binarySearch':
                // First sort the array for binary search
                const sortedArray = [...arrayCopy].sort((a, b) => a - b);
                operationSteps = generateBinarySearchSteps(sortedArray, params.value);
                break;
            case 'bubbleSort':
                operationSteps = generateBubbleSortSteps(arrayCopy);
                break;
        }
        
        totalSteps = operationSteps.length;
        updateStepIndicator();
        executeCurrentStep();
    }

    function generateInsertSteps(arr, value, index) {
        const steps = [];
        
        // Initial state
        steps.push({
            array: [...arr],
            description: `Initial array`,
            highlights: []
        });
        
        // Shift elements to the right
        for (let i = arr.length; i > index; i--) {
            steps.push({
                array: [...arr],
                description: `Shifting element from index ${i-1} to index ${i}`,
                highlights: [i-1, i]
            });
            arr[i] = arr[i-1];
        }
        
        // Insert the new value
        arr[index] = value;
        steps.push({
            array: [...arr],
            description: `Inserted value ${value} at index ${index}`,
            highlights: [index],
            newElement: index
        });
        
        return steps;
    }

    function generateUpdateSteps(arr, value, index) {
        const steps = [];
        
        // Initial state
        steps.push({
            array: [...arr],
            description: `Initial array`,
            highlights: []
        });
        
        // Update the value
        const oldValue = arr[index];
        arr[index] = value;
        steps.push({
            array: [...arr],
            description: `Updated value at index ${index} from ${oldValue} to ${value}`,
            highlights: [index],
            updatedElement: index
        });
        
        return steps;
    }

    function generateDeleteSteps(arr, index) {
        const steps = [];
        
        // Initial state
        steps.push({
            array: [...arr],
            description: `Initial array`,
            highlights: []
        });
        
        // Shift elements to the left
        for (let i = index; i < arr.length - 1; i++) {
            steps.push({
                array: [...arr],
                description: `Shifting element from index ${i+1} to index ${i}`,
                highlights: [i, i+1]
            });
            arr[i] = arr[i+1];
        }
        
        // Remove the last element
        arr.pop();
        steps.push({
            array: [...arr],
            description: `Removed element at index ${index}`,
            highlights: [],
            removedElement: index
        });
        
        return steps;
    }

    function generateLinearSearchSteps(arr, value) {
        const steps = [];
        
        // Initial state
        steps.push({
            array: [...arr],
            description: `Starting linear search for value ${value}`,
            highlights: []
        });
        
        // Search for the value
        let foundIndex = -1;
        for (let i = 0; i < arr.length; i++) {
            steps.push({
                array: [...arr],
                description: `Checking element at index ${i}: ${arr[i]} ${arr[i] === value ? '==' : '!='} ${value}`,
                highlights: [i],
                compare: [i]
            });
            
            if (arr[i] === value) {
                foundIndex = i;
                steps.push({
                    array: [...arr],
                    description: `Found value ${value} at index ${i}!`,
                    highlights: [i],
                    found: [i]
                });
                break;
            }
        }
        
        if (foundIndex === -1) {
            steps.push({
                array: [...arr],
                description: `Value ${value} not found in the array`,
                highlights: []
            });
        }
        
        return steps;
    }

    function generateBinarySearchSteps(arr, value) {
        const steps = [];
        
        // Initial state
        steps.push({
            array: [...arr],
            description: `Starting binary search for value ${value} in sorted array`,
            highlights: []
        });
        
        let left = 0;
        let right = arr.length - 1;
        let foundIndex = -1;
        
        while (left <= right) {
            const mid = Math.floor(left + (right - left) / 2);
            
            steps.push({
                array: [...arr],
                description: `Checking middle element at index ${mid}: ${arr[mid]}`,
                highlights: [mid],
                range: [left, right],
                mid: mid
            });
            
            if (arr[mid] === value) {
                foundIndex = mid;
                steps.push({
                    array: [...arr],
                    description: `Found value ${value} at index ${mid}!`,
                    highlights: [mid],
                    found: [mid]
                });
                break;
            } else if (arr[mid] < value) {
                left = mid + 1;
                steps.push({
                    array: [...arr],
                    description: `${arr[mid]} < ${value}, search in right half (indices ${left} to ${right})`,
                    highlights: [],
                    range: [left, right]
                });
            } else {
                right = mid - 1;
                steps.push({
                    array: [...arr],
                    description: `${arr[mid]} > ${value}, search in left half (indices ${left} to ${right})`,
                    highlights: [],
                    range: [left, right]
                });
            }
        }
        
        if (foundIndex === -1) {
            steps.push({
                array: [...arr],
                description: `Value ${value} not found in the array`,
                highlights: []
            });
        }
        
        return steps;
    }

    function generateBubbleSortSteps(arr) {
        const steps = [];
        
        // Initial state
        steps.push({
            array: [...arr],
            description: `Starting bubble sort`,
            highlights: []
        });
        
        const n = arr.length;
        
        for (let i = 0; i < n - 1; i++) {
            steps.push({
                array: [...arr],
                description: `Pass ${i + 1}`,
                highlights: []
            });
            
            for (let j = 0; j < n - i - 1; j++) {
                steps.push({
                    array: [...arr],
                    description: `Comparing elements at indices ${j} and ${j+1}: ${arr[j]} and ${arr[j+1]}`,
                    highlights: [j, j+1],
                    compare: [j, j+1]
                });
                
                if (arr[j] > arr[j+1]) {
                    // Swap elements
                    const temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                    
                    steps.push({
                        array: [...arr],
                        description: `Swapping elements: ${arr[j+1]} and ${arr[j]}`,
                        highlights: [j, j+1],
                        swap: [j, j+1]
                    });
                }
            }
        }
        
        steps.push({
            array: [...arr],
            description: `Array is now sorted!`,
            highlights: []
        });
        
        return steps;
    }

    function executeCurrentStep() {
        if (currentStep >= totalSteps) {
            array = [...operationSteps[totalSteps - 1].array];
            renderArray();
            showNotification('Step execution completed', 'success');
            return;
        }
        
        const step = operationSteps[currentStep];
        array = [...step.array];
        renderArray(step);
        updateStepIndicator();
    }

    function navigateStep(direction) {
        if (currentOperation === null) return;
        
        const newStep = currentStep + direction;
        
        if (newStep >= 0 && newStep < totalSteps) {
            currentStep = newStep;
            executeCurrentStep();
        }
    }

    function updateStepIndicator() {
        stepIndicator.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
        prevStepBtn.disabled = currentStep === 0;
        nextStepBtn.disabled = currentStep === totalSteps - 1;
    }

    function renderArray(step = null) {
        visualContent.innerHTML = '';
        
        if (array.length === 0) {
            visualContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cube"></i>
                    <p>Create an array to begin visualization</p>
                </div>
            `;
            return;
        }
        
        const arrayContainer = document.createElement('div');
        arrayContainer.className = 'array-container';
        
        // Create index labels
        const indexContainer = document.createElement('div');
        indexContainer.className = 'array-container';
        
        for (let i = 0; i < array.length; i++) {
            const indexLabel = document.createElement('div');
            indexLabel.className = 'array-index';
            indexLabel.textContent = i;
            indexContainer.appendChild(indexLabel);
        }
        
        visualContent.appendChild(indexContainer);
        
        // Create array elements
        for (let i = 0; i < array.length; i++) {
            const element = document.createElement('div');
            element.className = 'array-element';
            element.textContent = array[i];
            element.setAttribute('data-index', i);
            
            // Apply step-specific visual effects
            if (step) {
                if (step.highlights && step.highlights.includes(i)) {
                    element.classList.add('highlight');
                }
                
                if (step.compare && step.compare.includes(i)) {
                    element.classList.add('compare');
                }
                
                if (step.swap && step.swap.includes(i)) {
                    element.classList.add('swap');
                }
                
                if (step.found && step.found.includes(i)) {
                    element.classList.add('found');
                }
                
                if (step.newElement === i) {
                    element.classList.add('found');
                }
                
                if (step.updatedElement === i) {
                    element.classList.add('highlight');
                }
            }
            
            arrayContainer.appendChild(element);
        }
        
        visualContent.appendChild(arrayContainer);
        
        // Add description if available
        if (step && step.description) {
            const description = document.createElement('div');
            description.className = 'step-description';
            description.textContent = step.description;
            description.style.marginTop = '15px';
            description.style.padding = '10px';
            description.style.backgroundColor = '#2a2a2a';
            description.style.borderRadius = '6px';
            description.style.width = '100%';
            description.style.textAlign = 'center';
            description.style.fontSize = '0.9rem';
            visualContent.appendChild(description);
        }
    }

    function displayCode(operation, params) {
        let code = codeTemplates[operation];
        
        // Replace placeholders with actual values
        if (params.size !== undefined) {
            code = code.replace('{size}', params.size);
        }
        
        if (params.value !== undefined) {
            code = code.replace('{value}', params.value);
        }
        
        if (params.index !== undefined) {
            code = code.replace('{index}', params.index);
        }
        
        codeContent.innerHTML = `<pre><code>${code}</code></pre>`;
    }

    function animateLinearSearch(value) {
        let i = 0;
        const n = array.length;
        let found = false;
        
        // Clear previous highlights
        renderArray();
        
        animationTimer = setInterval(() => {
            if (i >= n || found) {
                clearInterval(animationTimer);
                if (!found) {
                    showNotification(`Value ${value} not found in the array`, 'info');
                }
                disableAnimationControls();
                return;
            }
            
            // Highlight current element
            const elements = document.querySelectorAll('.array-element');
            elements.forEach(el => el.classList.remove('compare', 'found'));
            elements[i].classList.add('compare');
            
            // Check if element matches
            if (array[i] === value) {
                elements[i].classList.remove('compare');
                elements[i].classList.add('found');
                found = true;
                showNotification(`Found value ${value} at index ${i}!`, 'success');
            }
            
            i++;
        }, animationSpeed);
    }

    function animateBinarySearch(value) {
        // First sort the array
        const sortedArray = [...array].sort((a, b) => a - b);
        array = sortedArray;
        renderArray();
        
        let left = 0;
        let right = sortedArray.length - 1;
        let found = false;
        
        animationTimer = setInterval(() => {
            if (left > right || found) {
                clearInterval(animationTimer);
                if (!found) {
                    showNotification(`Value ${value} not found in the array`, 'info');
                }
                disableAnimationControls();
                return;
            }
            
            const mid = Math.floor(left + (right - left) / 2);
            
            // Highlight current range and mid
            const elements = document.querySelectorAll('.array-element');
            elements.forEach(el => el.classList.remove('compare', 'found', 'highlight'));
            
            for (let i = left; i <= right; i++) {
                elements[i].classList.add('highlight');
            }
            
            elements[mid].classList.add('compare');
            
            // Check if element matches
            if (sortedArray[mid] === value) {
                elements[mid].classList.remove('compare');
                elements[mid].classList.add('found');
                found = true;
                showNotification(`Found value ${value} at index ${mid}!`, 'success');
            } else if (sortedArray[mid] < value) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }, animationSpeed);
    }

    function animateBubbleSort() {
        const arr = [...array];
        const n = arr.length;
        let i = 0, j = 0;
        let swapped = false;
        
        renderArray();
        
        animationTimer = setInterval(() => {
            if (i >= n - 1) {
                clearInterval(animationTimer);
                showNotification('Array sorting completed!', 'success');
                disableAnimationControls();
                return;
            }
            
            if (j >= n - i - 1) {
                if (!swapped) {
                    clearInterval(animationTimer);
                    showNotification('Array sorting completed!', 'success');
                    disableAnimationControls();
                    return;
                }
                i++;
                j = 0;
                swapped = false;
                return;
            }
            
            // Highlight current elements
            const elements = document.querySelectorAll('.array-element');
            elements.forEach(el => el.classList.remove('compare', 'swap'));
            elements[j].classList.add('compare');
            elements[j+1].classList.add('compare');
            
            // Check if elements need to be swapped
            if (arr[j] > arr[j+1]) {
                // Swap in the array
                const temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
                
                // Update the visual representation
                elements[j].textContent = arr[j];
                elements[j+1].textContent = arr[j+1];
                
                // Add swap animation
                elements[j].classList.add('swap');
                elements[j+1].classList.add('swap');
                
                swapped = true;
            }
            
            j++;
        }, animationSpeed);
    }

    function togglePlayPause() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            if (animationTimer) {
                clearInterval(animationTimer);
            }
            
            // Resume animation based on current operation
            switch (currentOperation) {
                case 'linearSearch':
                    animateLinearSearch(parseInt(searchValueInput.value));
                    break;
                case 'binarySearch':
                    animateBinarySearch(parseInt(searchValueInput.value));
                    break;
                case 'bubbleSort':
                    animateBubbleSort();
                    break;
            }
        } else {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (animationTimer) {
                clearInterval(animationTimer);
            }
        }
    }

    function stopAnimation() {
        if (animationTimer) {
            clearInterval(animationTimer);
            animationTimer = null;
        }
        
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        disableAnimationControls();
        renderArray();
    }

    function rewindAnimation() {
        stopAnimation();
        renderArray();
    }

    function updateAnimationSpeed() {
        const speedValue = parseInt(animationSpeedInput.value);
        // Invert the scale so higher value = faster animation
        animationSpeed = 1100 - (speedValue * 100);
    }

    function resetAnimationControls() {
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    function enableAnimationControls() {
        playPauseBtn.disabled = false;
        stopBtn.disabled = false;
        rewindBtn.disabled = false;
    }

    function disableAnimationControls() {
        playPauseBtn.disabled = true;
        stopBtn.disabled = true;
        rewindBtn.disabled = true;
    }

    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});