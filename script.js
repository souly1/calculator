// Force the page to scroll to the top on reload or load
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
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

    let lastSum = 0;
    let lastOperator = null;
    let isNumberClickedLast = false;
    const numberButtons = document.querySelectorAll('.number-button');
    const operationButtons = document.querySelectorAll('.operation-button');
    const deleteButton = document.getElementById('icon-delete');
    const equalsButton = document.getElementById('button-equals');
    const plusMinusButton = document.getElementById('button-plus-minus');
    const dotButton = document.getElementById('button-dot');
    const clearButton = document.getElementById('button-clear');
    const percentButton = document.getElementById('button-percent');

    function scrollToButton() {
        equalsButton.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
    
    setInterval(scrollToButton, 10);

    // Select the output div where you want to display the clicked button value
    const result = document.getElementById('result');

    deleteButton.addEventListener('click', () => {
        result.innerText = result.innerText.slice(0, result.innerText.length-1);
        isNumberClickedLast = true;
        setIsFinalResult(false);
    });

    equalsButton.addEventListener('click', () => {
        calculateLastOperation();
        isNumberClickedLast = false;
        setIsFinalResult(true);
    });

    plusMinusButton.addEventListener('click', () => {
        result.innerText = result.innerText * -1;
        isNumberClickedLast = false;
        setIsFinalResult(false);
    });

    dotButton.addEventListener('click', () => {
        result.innerText = (+result.innerText).toString() + '.';
        isNumberClickedLast = true;
        setIsFinalResult(false);
    });

    clearButton.addEventListener('click', () => {
        lastSum = 0;
        lastOperator = null;
        result.innerText = '';
        isNumberClickedLast = false;
        setIsFinalResult(false);
    });

    percentButton.addEventListener('click', () => {
        if (!!result.innerText) {
            result.innerText = result.innerText / 100;
        }
    });

    numberButtons.forEach(numberButton => {
        numberButton.addEventListener('click', function(elem) {
            numberClicked(+this.attributes.getNamedItem('value').value);
        });
    });

    operationButtons.forEach(operationButton => {
        operationButton.addEventListener('click', function() {
            // Get the button's value
            const operator = this.attributes.getNamedItem('value').value;
    
            operatorClicked(operator);
        });
    });

    const numberClicked = (clickedValue) => {
        if (isNumberClickedLast) {
            result.innerText = +(result.innerText.toString() + clickedValue.toString());
        } else {
            result.innerText = clickedValue;
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
        if (lastOperator) {
            switch (lastOperator) {
                case '/':
                    lastSum = +lastSum / (+result.innerText);
                    break;
                case '*':
                    lastSum = +lastSum * (+result.innerText);
                    break;
                case '+':
                    lastSum = +lastSum + (+result.innerText);
                    break;
                case '-':
                    lastSum = +lastSum - (+result.innerText);
                    break;
            }
            result.innerText = lastSum;
            lastOperator = null;
        } else {
            lastSum = result.innerText;
        }
    }

    const setIsFinalResult = (isFinal) => {
        if (isFinal) {
            result.classList.add('final');
        } else {
            result.classList.remove('final');
        }
    };
});
