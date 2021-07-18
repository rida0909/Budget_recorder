var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum; 
    };

    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }

    return{

        addItem : function(type, des, val){
            var newItem, ID;

            if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem : function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget : function(){
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },

        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget : function(){
            return{
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
        },

        testing : function (){
            console.log(data);
        }
    };

})();



var UIController = (function() {

    DOMStrings = {
        inputType : '.add__type',
        inputDesc : '.add__description',
        inputVal : '.add__value',
        inputBtn : '.add__btn', 
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensePercLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    };

var formatNumbers = function(num, type){
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i <list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput : function(){
        return {
            type : document.querySelector(DOMStrings.inputType).value,
            description : document.querySelector(DOMStrings.inputDesc).value,
            value : parseFloat(document.querySelector(DOMStrings.inputVal).value)
        };
    },

        addListItem : function(obj, type) {
            var html, newHtml, element;

            if(type === 'inc'){
                element = DOMStrings.incomeContainer; 

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'  
            }
            else if (type === 'exp'){
                element = DOMStrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div> </div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumbers(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem : function(selectorId){
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields : function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputVal);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget : function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumbers(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumbers(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumbers(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '----';
            }
        },

        desplayPercentage : function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensePercLabel);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent = '----';
                }
            });
        },

        displayMonth : function () {
            var now, year, month, months;

            now = new Date();

            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',]
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType : function (){
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDesc + ',' + DOMStrings.inputVal);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings : function(){
            return DOMStrings;
        }
};
})();



var controller = (function(budgetCtrl, UICtrl) {

    setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keycode === 13 || event.which === 13){
                ctrlAddItem();
            }
        }); 

        document.querySelector(DOM.container).addEventListener('click', crtlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function(){

        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
    };

    var updatePercentage = function(){
        budgetCtrl.calculatePercentages();

        var percentages = budgetCtrl.getPercentages();

        console.log(percentages);

        UICtrl.desplayPercentage(percentages);
    };

    var ctrlAddItem = function(){

        var input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){

        var newItem = budgetCtrl.addItem(input.type, input.description, input.value); 

        UICtrl.addListItem(newItem, input.type);

        UICtrl.clearFields();

        updateBudget();

        updatePercentage();
        }
    };

    var crtlDeleteItem = function(event){

        var itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            
            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemId);

            updateBudget();

            updatePercentage();
        }
    }

    return {
        init : function(){
            console.log("working");

            UICtrl.displayMonth();

            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setupEventListeners();
        }
    };
  
})(budgetController, UIController);

controller.init();