const { distributeInputCash, distributeOutputChange, resupplyMisc } = require('./helperFunctions');

const VendingMachine = class {
	constructor(stock, balance) {
		this.inventory = stock;
		this.denominations = balance.sort((a, b) => b.value - a.value);
	}
};

VendingMachine.prototype.printInventory = function () {
	const inventoryList = this.inventory.map(item => `${item.amount} ${item.title}`).join(", ");
	return `This vending machine contains ${inventoryList}`;
};

VendingMachine.prototype.restockItems = function (updateObj) {
	if (typeof updateObj.id === 'number') {
		const snackToUpdate = this.inventory.find(item => item.id === updateObj.id);
		const snackTitle = snackToUpdate.title;
		return resupplyMisc(updateObj, this.inventory, snackToUpdate, snackTitle)
	}
	return resupplyMisc(updateObj, this.inventory);
};

VendingMachine.prototype.resupplyChange = function (updateObj) {
	if (updateObj.id.toUpperCase() !== 'ALL' && typeof updateObj.id === 'string') {
		const denomToUpdate = this.denominations.find(denom => denom.denom === updateObj.id);
		const denomId = denomToUpdate.denom;
		return resupplyMisc(updateObj, this.denominations, denomToUpdate, denomId);
	}
	return resupplyMisc(updateObj, this.denominations);
};

VendingMachine.prototype.checkCoinTotals = function () {
	return this.denominations.reduce((acc, item) => {
		acc.push({
			denom: item.denom,
			amount: item.amount
		});
		return acc;
	}, []);
};

VendingMachine.prototype.checkTotalBalance = function () {
	return this.denominations.reduce((acc, item) => {
		acc += item.value * item.amount;
		return acc;
	}, 0);
};

VendingMachine.prototype.dispense = function (orderId, cash) {
	// MUTATED INPUT CHECKS
	if (!Number(orderId)) {
		throw new Error("I'm sorry, please enter a valid input");
	}
	if (!this.inventory.find(item => item.id === orderId)) {
		throw new Error("I'm sorry, that item does not exist");
	}

	const desiredItem = this.inventory.find(item => item.id === orderId);
	cash = Math.round(cash * 100) / 100;
	let price = Math.round(desiredItem.price * 100) / 100;

	// CASH LEVEL CHECKS
	if (desiredItem.amount === 0) {
		throw new Error(`I'm sorry, that item is out of stock`);
	}
	if (cash < price) {
		const requiredDifference = desiredItem.price - cash;
		throw new Error(`I'm sorry, you have not entered enough money for that item. \nPlease add another $${requiredDifference}`);
	}
	if (this.checkTotalBalance() < (cash - price)) {
		throw new Error(`I'm sorry, there isn't enough money left in this machine for that purchase`);
	}

	// BEGIN DISPENSING
	if (cash >= price) {
		desiredItem.amount -= 1;
		let change = cash - price;
		change = Math.round(change * 100) / 100;
		// split input cash into highest denominations and distribute -- yes, it's fixed ¯\(ツ)/¯
		this.denominations = distributeInputCash(this.denominations, cash);
		// calculate return change and split into highest coins possible
		const toReturn = distributeOutputChange(this.denominations, change);
		return (toReturn.length === 0)
			? `Here is your ${desiredItem.title}`
			: `Here is your ${desiredItem.title} and change: ${toReturn.join(' & ')}`
	}
};

module.exports = VendingMachine;