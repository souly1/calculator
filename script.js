// Force the page to scroll to the top on reload or load
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/calculator/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
        
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            setTimeout(() => {
                if (registrations.length > 0) {
                    window.scrollTo(0, document.body.scrollHeight);
                    document.body.classList.add('no-scroll');
                    document.documentElement.classList.add('no-scroll');
                }
            }, 300);
        });
    });
}
window.addEventListener('load', function() {
    this.setTimeout(() => {
        window.scrollTo(0, 0); // Scroll to the top of the page
        this.setTimeout(() => {
            window.addEventListener('scroll', function() {
                if (window.scrollY > window.innerHeight / 2) {
                    window.removeEventListener('scroll', arguments.callee);
                    this.setTimeout(() => {
                        document.body.classList.add('no-scroll');
                        document.documentElement.classList.add('no-scroll');
                    }, 1000);                 
                }
            });
        }, 10);
    }, 100);

    let equalsClickCount = 0;
    let lastSum = 0;
    let lastOperator = null;
    let isNumberClickedLast = false;
    let numOfRulerClicked = 0;
    let numOfAdvancedClicked = 0;
    const calcBodyAndroid = document.getElementById('calc-body-android');
    const calcBodyIos = document.getElementById('calc-body-ios');
    const numberButtons = document.querySelectorAll('.number-button');
    const operationButtons = document.querySelectorAll('.operation-button');
    const deleteButtons = document.querySelectorAll('.icon-delete');
    const equalsButtons = document.querySelectorAll('.button-equals');
    const plusMinusButtons = document.querySelectorAll('.button-plus-minus');
    const dotButtons = document.querySelectorAll('.button-dot');
    const clearButtons = document.querySelectorAll('.button-clear');
    const clearIosButton = document.getElementById('button-clear-ios');
    const percentButtons = document.querySelectorAll('.button-percent');
    const fullscreenButton = document.getElementById('fullscreen-button');
    const iconAdvanced = document.getElementById('icon-advanced');
    const iconRuler = document.getElementById('icon-ruler');
    const advancedSettingsWindow = this.document.getElementById('advanced-settings');
    const advancedClearButton = document.getElementById('advanced-clear-button');
    const advancedCancelButton = document.getElementById('advanced-cancel-button');
    const advancedSaveButton = document.getElementById('advanced-save-button');
    const iterationInput = document.getElementById('iteration');
    const value1Input = document.getElementById('value-1');
    const value2Input = document.getElementById('value-2');
    const value3Input = document.getElementById('value-3');
    const results = document.querySelectorAll('.result');

    function enterFullscreen() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, and Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }

        fullscreenButton.classList.toggle('hidden');
    }
    
    fullscreenButton.addEventListener('click', enterFullscreen);

    // Select the output div where you want to display the clicked button value

    iconAdvanced.addEventListener('click', () => {
        clearActiveOperator();
        numOfAdvancedClicked++;
        if (numOfAdvancedClicked > 3) {
            advancedSettingsWindow.classList.toggle('hidden');
        }
    });

    iconRuler.addEventListener('click', () => {
        clearActiveOperator();
        numOfRulerClicked++;
        if (numOfRulerClicked === 3) {
            const curreText = [getResult()];
            localStorage.setItem("nextResults", JSON.stringify(curreText));
            setForceInterval(1);
            setResult('');
            numOfRulerClicked = 0;
        }
    });

    deleteButtons.forEach(deleteButton => {
        deleteButton.addEventListener('click', () => {
            clearActiveOperator();
            const oldResult = getResult();
            setResult(oldResult.slice(0, oldResult.length-1));
            isNumberClickedLast = true;
            setIsFinalResult(false);
        });
    });

    equalsButtons.forEach(equalsButton => {
        equalsButton.addEventListener('click', () => {
            clearActiveOperator();
            equalsClickCount++;
            calculateLastOperation();
            isNumberClickedLast = false;
            checkForce();
            setIsFinalResult(true);
        });
    });

    plusMinusButtons.forEach(plusMinusButton => {
        plusMinusButton.addEventListener('click', () => {
            clearActiveOperator();
            const oldResult = getResult();
            setResult(oldResult * -1);
            isNumberClickedLast = false;
            setIsFinalResult(false);
        });
    });

    dotButtons.forEach(dotButton => {
        dotButton.addEventListener('click', () => {
            clearActiveOperator();
            setResult((+result.innerText).toString() + '.');
            isNumberClickedLast = true;
            setIsFinalResult(false);
        });
    });

    clearButtons.forEach(clearButton => {
        clearButton.addEventListener('click', () => {
            clearActiveOperator();
            numOfAdvancedClicked = 0;
            lastSum = 0;
            lastOperator = null;
            setResult('');
            isNumberClickedLast = false;
            setIsFinalResult(false);
            setClearIosButtonText();
        });
    });

    percentButtons.forEach(percentButton => {
        percentButton.addEventListener('click', () => {
            clearActiveOperator();
            const oldResult = getResult();
            if (!!oldResult) {
                setResult(oldResult / 100);
            }
        });
    });

    numberButtons.forEach(numberButton => {
        numberButton.addEventListener('click', function(elem) {
            clearActiveOperator();
            numberClicked(+this.attributes.getNamedItem('value').value);
            setClearIosButtonText();
        });
    });

    operationButtons.forEach(operationButton => {
        operationButton.addEventListener('click', function() {
            clearActiveOperator();
            this.parentElement.classList.add('active');
            const operator = this.attributes.getNamedItem('value').value;
            operatorClicked(operator);
        });
    });

    const setClearIosButtonText = () => {
        const res = getResult();
        clearIosButton.innerHTML = (!!res) ? 'C' : 'AC';
    }

    const numberClicked = (clickedValue) => {
        if (isNumberClickedLast) {
            const oldResult = getResult();
            setResult(+(oldResult.toString() + clickedValue.toString()));
        } else {
            setResult(clickedValue);
        }
        isNumberClickedLast = true;
        setIsFinalResult(false);
    }

    const operatorClicked = (operator) => {
        calculateLastOperation();
        lastOperator = operator;
        isNumberClickedLast = false;
        setIsFinalResult(false);
    }

    const calculateLastOperation = () => {
        const oldResult = getResult();
        if (lastOperator) {
            switch (lastOperator) {
                case '/':
                    lastSum = +lastSum / (+oldResult);
                    break;
                case '*':
                    lastSum = +lastSum * (+oldResult);
                    break;
                case '+':
                    lastSum = +lastSum + (+oldResult);
                    break;
                case '-':
                    lastSum = +lastSum - (+oldResultt);
                    break;
            }
            setResult(lastSum);
            lastOperator = null;
        } else {
            lastSum = oldResult;
        }
    }

    const setIsFinalResult = (isFinal) => {
        if (isFinal) {
            results.forEach((result) => {
                result.classList.add('final');
            })
        } else {
            results.forEach((result) => {
                result.classList.remove('final');
            }) 
        }
    };

    const setForceInterval = (inter) => {
        this.localStorage.setItem("nextInterval", inter);
    }

    const checkForce = () => {
        const currInterval = +this.localStorage.getItem("nextInterval") ?? 1;
        if (equalsClickCount % currInterval === 0) {
            tryGetForceNumber();
        }
    }

    const tryGetForceNumber = () => {
        const nextResults = JSON.parse(localStorage.getItem("nextResults"));
        const valToSet = nextResults.pop();
        if (valToSet !== null && valToSet !== undefined) {
            setResult(valToSet);
            this.localStorage.setItem("nextResults", JSON.stringify(nextResults));
        }
    }


    advancedClearButton.addEventListener('click', () => {
        iterationInput.value = 2;
        value3Input.value = '';
        value2Input.value = '';
        value1Input.value = '';
    });

    advancedCancelButton.addEventListener('click', () => {
        advancedSettingsWindow.classList.toggle('hidden');
    });

    advancedSaveButton.addEventListener('click', () => {
        this.localStorage.setItem("nextInterval", iterationInput.value);
        const nextResults = [];
        if (value3Input.value !== undefined && value3Input.value !== null) {
            nextResults.push(+value3Input.value);
        }
        if (value2Input.value !== undefined && value2Input.value !== null) {
            nextResults.push(+value2Input.value);
        }
        if (value1Input.value !== undefined && value1Input.value !== null) {
            nextResults.push(+value1Input.value);
        }
        this.localStorage.setItem("nextResults", JSON.stringify(nextResults));

        advancedSettingsWindow.classList.toggle('hidden');
    });

    const getResult = () => {
        return results[0].innerText;
    }

    const setResult = (newVal) => {
        results.forEach((result) => {
            result.innerText = newVal;
        })
    }

    const detectAndSetUiDevice = () => {
        const userAgent = navigator.userAgent;

        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            console.log('Device is iOS');
            calcBodyAndroid.classList.toggle('hidden');
            calcBodyIos.classList.toggle('hidden');
        } else if (/android/i.test(userAgent)) {
            console.log('Device is Android');
        } else {
            console.log('Device is neither iOS nor Android');
        }
    }

    const clearActiveOperator = () => {
        operationButtons.forEach(operationButton => {
            operationButton.parentElement.classList.remove('active');
        });
    };
    detectAndSetUiDevice();
});
