

// create globals
const OPERATOR_EQUALS = '=';
const OPERATOR_PLUS = '+';
const OPERATOR_MINUS = '-';
const OPERATOR_MULTIPLY = '*';
const OPERATOR_DIVIDE = '/';
const CLEAR = 'clear';
const ALL_CLEAR = 'all_clear'
const BACKSPACE = 'backspace';
const PLUS_MINUS = 'plus_minus';

const STATE_OPERAND_1 = 1;
const STATE_OPERATOR = 2;
const STATE_OPERAND_2 = 3;
const STATE_EQUALS = 4
const DISPLAY_BUFFER_MAX = 12;

const operators = {
    equals: "=",
    plus: "+",
    divide: "/",
    minus: "-",
    multiply: "*"
}


class CalculatorState {

    constructor() {

        this.displayBuffer = "0";
        this.currentState = STATE_OPERAND_1;
        this.currentOperand1_value = 0;
        this.currentOperand2_value = 0;
        this.currentOperator = "";
        this.currentResult = 0;
        this.isPositive = true;

    }
}

// new up calc object state store with default values.
const calc = new CalculatorState();

// define HTML elements
const displayElement = document.getElementById("display");
const displayOperand1 = document.getElementById("operand_1");
const displayOperand2 = document.getElementById("operand_2");
const displayOperator = document.getElementById("operator");
const displayResult = document.getElementById("result");

// handles numeric input
function inputButtonPressed(inputData) {

    switch (calc.currentState) {

        // if operand state, just fall through and process
        case STATE_OPERAND_1:
        case STATE_OPERAND_2:

            break;

        //if we started entering numbers, and we are in operator state,
        //move along to operand2 state
        case STATE_OPERATOR:
            
            calc.currentState = STATE_OPERAND_2;
            break;

        // reset state and start taking numbers back in operand_1 state
        case STATE_EQUALS:
            resetState();
            break;

    }

    // in all cases, we process and update
    processNumericInput();
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
function operatorButtonPressed(operator) {


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
            if ((operator != OPERATOR_EQUALS) & (calc.displayBuffer != "0")) {
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
                break;4564
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


// handler for pressing a clear, all clear or backspace
function clearButtonPressed(clearInput) {

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

// when we press on operator after an equals operation
function resetForContinue(operator) {
    //move result to operand_1 and set the operator to the new operator
    // then set the 
    resetState(calc.currentResult, operator, STATE_OPERATOR)
        
}


// reset the state of our object and UI to default
function resetState(operand_1 = 0, operator = '', state = STATE_OPERAND_1) {
    calc.currentOperand1_value = operand_1;
    calc.currentOperator = operator;
    calc.currentState = state;
    calc.currentOperand2_value = 0;
    calc.currentResult = 0;
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
    displayOperator.innerText = calc.currentOperator;
    
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
}

function calculateResult() {

    calc.currentOperand2_value = getDisplayValue();
    let result = 0

    // eval works great to eliminate the switch statement here for various operations.
    result = eval(calc.currentOperand1_value.toString() + calc.currentOperator + calc.currentOperand2_value.toString());
    
    calc.displayBuffer = String(Math.abs(result));
    calc.isPositive = (result == (Math.abs(result)));
    calc.currentResult = result;
}


// EVENT WIRING //

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
        operatorButtonPressed(operators[btn]);

    })
})

buttonList3 = ["clear", "all_clear", "backspace"]
buttonList3.forEach(btn => {

    document.getElementById(btn).addEventListener('click', function () {
        clearButtonPressed(btn);

    })
})

document.body.addEventListener('keypress', (event) => {

    let key = event.key;

    switch (true) {

        case ['0', '1','2','3','4','5','6','7','8','9',"\\",'.'].includes(key):
            inputButtonPressed(key);
            break;

        case ['+', '-', '*', '/', '='].includes(key):
            operatorButtonPressed(key);
            break;
        case ['Enter'].includes(key):
            operatorButtonPressed("=");
            break;

        }
})

// document.body.addEventListener('keydown', (event) => {


// wiring up copy/paste
document.body.addEventListener("keydown", function (ev) {

    switch (ev.key) {

        case 'Escape':
            clearButtonPressed('clear')
            break;
        case 'Backspace': case 'Delete':
            clearButtonPressed("backspace");
            break;
        
    }

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
            inputButtonPressed(clipText);
        }
    })
    }
    else if (key == 'c' && ctrl) {
  
        // If key pressed is C and if ctrl is true.
        // print in console.
        navigator.clipboard.writeText(String(calc.displayBuffer));

        // we have to hack around not having a timer event. we call this, and reset the state
        // then we call it again immediately. This plays the animation.
        const notice = document.getElementById("copy_notice");
        displayCopyNotice();
        setTimeout(displayCopyNotice,0)
    }
  
}, false);

// clipboard notice helper function
function displayCopyNotice() {
    const notice = document.getElementById("copy_notice");
    notice.classList.toggle("elementToFadeInAndOut");
    notice.style.display = "block";

}


//update the display the first time through.
updateDisplay();

