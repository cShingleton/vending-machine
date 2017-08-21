const stock = require('../lib/stock');
const startingBalance = require('../lib/startBalance');
const VendingMachine = require('../lib/vendingMachine');
const VM1 = new VendingMachine(stock, startingBalance); // for dispense tests
const VM2 = new VendingMachine(stock, startingBalance); // for cash and inventory tests

describe('vendingMachine', () => {

    // ERROR TESTING
    describe('error-checking', () => {
        it('should throw a \'insufficient cash\' error if change submitted is too little for item', () => {
            expect(() => VM1.dispense(1, 1.25)).toThrow();
        });

        it('should throw if the desiredItem has amount of 0 to dispense', () => {
            expect(() => VM1.dispense(4, 1.75)).toThrow();
        });

        it('should throw an undefined error if the orderInput is mutated', () => {
            expect(() => VM1.dispense("gimme", 1.75)).toThrow();
        });

        it('should throw an unmatched error if the orderInput doesn\'t match machine\'s items', () => {
            expect(() => VM1.dispense(234, 1.75)).toThrow();
        });

        it('should throw an insufficient change error if there\'s not enough money in the machine to return change', () => {
            const VM3 = new VendingMachine(stock, [{ denom: "NICKEL", value: 0.05, amount: 5}]);
            expect(() => VM3.dispense(1, 2)).toThrow();
        });
    });

    // CASH TESTING 
    describe('cash-functionality', () => {
        it('should return an array of current totals of each monetary denomination in the machine', () => {
            const received = VM2.checkCoinTotals();
            const twenties = {
                denom: "TWENTY",
                amount: 5
            };
            expect(received).toContainEqual(twenties);
        });

        it('should return an integer representing the total current value of denoms', () => {
            const received = VM2.checkTotalBalance();
            const expected = 725;
            expect(received).toBe(expected);
        });

        it('should return new amount of chosen denom when singularly updating denominations', () => {
            const received = VM2.resupplyChange({ id: "TWENTY", value: 1 });
            const expected = "Update complete. Current total of TWENTYs: 6";
            expect(received).toBe(expected);
        });

        it('should return new amount of denoms in denominations when updating entire balance', () => {
            const received = VM2.resupplyChange({ id: "all", value: 1 });
            const updatedHundos = {
                denom: "ONE HUNDRED",
                value: 100,
                amount: 2
            };
            expect(received).toContainEqual(updatedHundos);
        });
    });

    // INVENTORY CHECKING
    describe('inventory-functionality', () => {
        it('should print the machine\'s inventory', () => {
            const received = VM2.printInventory();
            expect(received).toContain("Nutz");
        });

        it('should return new amount of chosen item when singularly updating inventory', () => {
            const received = VM2.restockItems({ id: 3, value: 5 });
            const expected = "Update complete. Current total of Munchies packs: 10";
            expect(received).toBe(expected);
        });

        it('should return new amount of items in inventory when updating entire inventory', () => {
            const received = VM2.restockItems({ id: "all", value: 3 });
            const updatedDPretzels = {
                id: 4,
                title: "Dark pretzels",
                price: 2.50,
                amount: 3 //the amount is five because one has been dispensed in an earlier test
            };
            expect(received).toContainEqual(updatedDPretzels);
        });
    });

    // DISPENSING TESTING 
    describe('dispense-functionality', () => {
        it('should dispense an item and no change if exact', () => {
            const received = VM1.dispense(1, 1.50);
            const expected = "Here is your Crab chips";
            expect(received).toBe(expected);
        });

        it('should dispense an item and change if cash > price', () => {
            const received = VM1.dispense(1, 2.75);
            const expected = "Here is your Crab chips and change: 1 ONEs & 1 QUARTERs";
            expect(received).toBe(expected);
        });
    });
});
