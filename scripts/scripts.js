

// create globals
const OPERATOR_EQUALS = 'equals';
const OPERATOR_PLUS = 'plus';
const OPERATOR_MINUS = 'minus';
const OPERATOR_MULTIPLY = 'multiply';
const OPERATOR_DIVIDE = 'divide';
const CLEAR = 'clear';
const ALL_CLEAR = 'all_clear'
const BACKSPACE = 'backspace';
const PLUS_MINUS = 'plus_minus';

const STATE_OPERAND_1 = 1;
const STATE_OPERATOR = 2;
const STATE_OPERAND_2 = 3;
const STATE_EQUALS = 4
const DISPLAY_BUFFER_MAX = 12;

class CalculatorState {

    constructor(displayBuffer,
        currentState,
        currentOperand1_value,
        currentOperand2_value,
        currentOperator,
        currentResult,
        isPositive) {

        this.displayBuffer = displayBuffer;
        this.currentState = currentState;
        this.currentOperand1_value = currentOperand1_value;
        this.currentOperand2_value = currentOperand2_value;
        this.currentOperator = currentOperator;
        this.currentResult = currentResult;
        this.isPositive = isPositive;
    }
}

const calc = new CalculatorState("0", 1, 0, 0, 0, 0 , true);

// define HTML elements
const displayElement = document.getElementById("display");
const displayOperand1 = document.getElementById("operand_1");
const displayOperand2 = document.getElementById("operand_2");
const displayOperator = document.getElementById("operator");
const displayResult = document.getElementById("result");

// handles numeric input
function inputButtonPressed(inputData) {

    switch (calc.currentState) {

        case STATE_OPERAND_1:
        case STATE_OPERAND_2:

            processNumericInput();
            break;

        case STATE_OPERATOR:

            //if we started entering numbers, and we are in operator state, move along to operand2 state
            calc.currentState = STATE_OPERAND_2;
            processNumericInput();
            break;


        case STATE_EQUALS:
            resetState();
            processNumericInput();
            break;

    }

    updateDisplay();

    function processNumericInput() {
        if ((displaySign() + calc.displayBuffer).length < DISPLAY_BUFFER_MAX) {


            // it may be multi char because of the clipboard.
            for (let c of inputData) {

                //handle special cases 0, . ± 
                switch (c) {

                    case "dot": case ".":
                        // if it dot doesn't already exist, add it.
                        if (!(calc.displayBuffer.includes("."))) {
                            calc.displayBuffer += ".";
                        }
                        break;

                    case "0":
                        // if it's a zero and there isn't already 0, add it.
                        if (!(getDisplayValue() == 0)) {
                            calc.displayBuffer += "0";
                        }
                        break;

                    case "\\": case PLUS_MINUS:
                        // if positive, invert
                        calc.isPositive = !(calc.isPositive);
                        break;
                }
                //normal number
                let tempValue = +c;
                if (tempValue >= 1 & tempValue <= 9) {
                    //if currently a zero, update the display
                    if (calc.displayBuffer != "0") {
                        calc.displayBuffer += c;
                    } else {
                        calc.displayBuffer = c;
                    }
                }
            }
        }
    }
}
// when an operator button is pressed
function operatorPressed(operator) {


    switch (calc.currentState) {

        //if we get two operators in a row, update the operator as long as it isn't an equals sign.
        case (STATE_OPERATOR):
            if (operator != OPERATOR_EQUALS) {
                calc.currentOperator = operator;
                break;
            }

        //if we are still entering the first operand and we get an operator, then we can
        //move the state to the next state and finalize the first operand.
        case (STATE_OPERAND_1):

            //if not equals, finalize operand one
            if (operator != OPERATOR_EQUALS) {
                calc.currentState = STATE_OPERATOR;
                calc.currentOperator = operator;
                calc.currentOperand1_value = getDisplayValue();
                resetDisplayValue();
                break;
            }
            // its an equals sign, we ignore????
            else {
                break;
            }

        // we are entering operand 2 and get an operator.
        case (STATE_OPERAND_2):

            if (operator == OPERATOR_EQUALS) {

                calculateResult();
                calc.currentState = STATE_EQUALS;

            }
            // it's another operator, treat it like equals, but then place into the operand state
            else {
                calculateResult();
                resetForContinue(operator);
                break;
            }
            
        case (STATE_EQUALS):
            if (operator == OPERATOR_EQUALS) {
                //do nothing
                break;
            } else {
                // move the value of result to operand one and reset
                resetForContinue(operator);
                break;

            }
    }

    updateDisplay();
}

// when we press on operator after an equals operation
function resetForContinue(operator) {
    calc.currentOperand1_value = calc.currentResult;
    calc.currentOperator = operator;
    resetDisplayValue();
    calc.currentState = STATE_OPERATOR;
    calc.currentOperand2_value = 0;
    calc.currentResult = 0;
}

// handler for pressing a clear, all clear or backspace
function clearPressed(clearInput) {

    // when the ALL clear button is pressed, delete the current buffer, reset all state
    if (clearInput === ALL_CLEAR) {
        // reset state
        resetState();

    }
    // when the clear button is pressed, delete the current buffer
    // reset some state
    else if (clearInput === CLEAR) {

        //if it's already reset, then do an all clear.
        if (calc.displayBuffer == "0") {
            resetState();
        }
        else
        {
            // reset the buffer
            resetDisplayValue();

            //Reset state depending on current state
            switch (calc.currentState) {
                case STATE_OPERAND_1: 
                case STATE_OPERATOR: 
                case STATE_EQUALS:
                    // reset the buffer
                    resetState();
                    break;

                case STATE_OPERAND_2:
                    // reset the buffer
                    calc.displayBuffer = "0";
                    calc.currentOperand2_value = 0;
                    calc.currentState = STATE_OPERATOR;
                    break;
            }
        }
    } else if (clearInput === BACKSPACE) {

        switch (calc.currentState) {
            case STATE_OPERAND_1:
            case STATE_OPERAND_2:
                if (calc.displayBuffer != "0") {

                    calc.displayBuffer = calc.displayBuffer.substring(0, calc.displayBuffer.length - 1)
                }
                //reset it back to 0 if backed up.
                if (calc.displayBuffer.length == 0) {
                    calc.isPositive = true;
                    calc.displayBuffer = 0;
                }
                break;
            case STATE_OPERATOR:
            case STATE_EQUALS:
                //do nothing
                break;
        }
    }
    updateDisplay();
}


// reset the state of our object and UI to default
function resetState() {
    calc.currentOperator = 0;
    calc.currentState = STATE_OPERAND_1;
    calc.currentOperand1_value = 0;
    calc.currentOperand2_value = 0;
    calc.currentResult = 0;
    calc.currentOperator = '';
    resetDisplayValue();
}

// take the object data and update the UI
function updateDisplay() {
    if(calc.currentState == STATE_EQUALS) {
        displayElement.innerText = (displaySign() + calc.displayBuffer).substring(0, 12);    
    }
    else {
        displayElement.innerText = (displaySign() + calc.displayBuffer);
    }
    displayOperand1.innerText = formatNumberOutput(calc.currentOperand1_value);
    displayOperand2.innerText = formatNumberOutput(calc.currentOperand2_value);
    displayResult.innerText = formatNumberOutput(calc.currentResult).substring(0, 12);
    displayOperator.innerText = getCurrentOperator();
    
    //set `focus` to our focus object
    document.getElementById("focus_object").focus();

}


// what sign to display in the UI
function displaySign() {
    if (calc.isPositive == true) {
        return "";
    } else {
        return "-";
    }
}

//
function formatNumberOutput(operand) {
    if (operand == 0) {
        return ""
    } else {
        return String(operand).substring(0, 12)
    }
}

function getDisplayValue() {
    let tempValue = 0;
    if (calc.displayBuffer.includes(".")) {
        tempValue = parseFloat(displaySign() + calc.displayBuffer);
    } else {
        tempValue = parseInt(displaySign() + calc.displayBuffer);
    }
    return (tempValue);

}

function resetDisplayValue() {
    calc.displayBuffer = "0";
    calc.isPositive = true;
    //set focus to something else
    document.getElementById("focus_object").focus();

}

function getCurrentOperator() {
    let result = ""
    switch (calc.currentOperator) {
        case OPERATOR_DIVIDE:
            result = "/";
            break;
        case OPERATOR_MINUS:
            result = "-";
            break;
            break;
        case OPERATOR_PLUS:
            result = "+";
            break;
        case OPERATOR_MULTIPLY:
            result = "*";
            break;
    }
    return result
}

function calculateResult() {

    calc.currentOperand2_value = getDisplayValue();
    let result = 0

    switch (calc.currentOperator) {
        case OPERATOR_DIVIDE:
            result = calc.currentOperand1_value / calc.currentOperand2_value;
            break;
        case OPERATOR_MINUS:
            result = calc.currentOperand1_value - calc.currentOperand2_value;
            break;
            break;
        case OPERATOR_PLUS:
            result = calc.currentOperand1_value + calc.currentOperand2_value;
            break;
        case OPERATOR_MULTIPLY:
            result = calc.currentOperand1_value * calc.currentOperand2_value;
            break;
    }

    calc.displayBuffer = String(Math.abs(result));
    calc.isPositive = (result == (Math.abs(result)));
    calc.currentResult = result;

}


// add events to wire up buttons to functions
buttonList = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "dot", "plus_minus"]
buttonList.forEach(btn => {


    document.getElementById(btn).addEventListener('click', function () {
        let btn_code = btn;
        if (btn == 'dot') {
            btn_code = ".";
        }
        else if (btn == 'plus_minus') {
                btn_code = "\\";    
        }
        inputButtonPressed(btn_code);

    })
})

buttonList2 = ["minus", "divide", "multiply", "equals", "plus"]
buttonList2.forEach(btn => {

    document.getElementById(btn).addEventListener('click', function () {
        operatorPressed(btn);

    })
})

buttonList3 = ["clear", "all_clear", "backspace"]
buttonList3.forEach(btn => {

    document.getElementById(btn).addEventListener('click', function () {
        clearPressed(btn);

    })
})

document.getElementById("focus_object").addEventListener('keypress', (event) => {

    let key = event.key;
    switch (key) {

        //
        case '0': case '1': case '2': case '3': case '4': 
        case '5': case '6': case '7': case '8': case '9':
            inputButtonPressed(event.key);
            break;
        case '.':
            inputButtonPressed(".");
            break;
        case "+":
            operatorPressed("plus");
            break;
        case "\\":
            inputButtonPressed("\\");
            break;
        case '*':
            operatorPressed("multiply");
            break;
        case '/':
            operatorPressed("divide");
            break;
        case '-':
            operatorPressed("minus");
            break;
        case '=': case 'Enter':
            operatorPressed("equals");
            break;

    }
})

document.getElementById("focus_object").addEventListener('keydown', (event) => {

    switch (event.key) {

        //
        case 'Escape':
            clearPressed('clear')
            break;
        case 'Backspace': case 'Delete':
            clearPressed("backspace");
            break;


    }
})

function handleFocus() {
    document.getElementById("focus_object").focus();
}

document.getElementById("focus_object").addEventListener('blur', (event) => {
   handleFocus();
})

document.body.addEventListener("keydown", function (ev) {
  
    // function to check the detection
    ev = ev || window.event;  // Event object 'ev'
    var key = ev.key.toLowerCase(); // Detecting keyCode
      
    // Detecting Ctrl
    var ctrl = ev.ctrlKey ? ev.ctrlKey : ((key === 17)
        ? true : false);
  
    // If key pressed is V and if ctrl is true.
    if (key == 'v' && ctrl) {
        
        navigator.clipboard.readText().then((clipText) => {
        
        parsedValue = Number(clipText);

        if (!(parsedValue === NaN)) {
            inputButtonPressed(clipText)
        }
    })
    }
    else if (key == 'c' && ctrl) {
  
        // If key pressed is C and if ctrl is true.
        // print in console.
        navigator.clipboard.writeText(String(calc.displayBuffer))
    }
  
}, false);


updateDisplay();

