// to update items / balance based on input 
exports.resupplyMisc = (updateObj, array, toUpdate, itemId) => {
    if (isNaN(updateObj.id) && updateObj.id.toUpperCase() === "ALL") {
        const updatedTotal = array.map(item => {
            item.amount += updateObj.value;
            return item;
        });
        return updatedTotal;
    } else {
        toUpdate.amount += updateObj.value;
        return `Update complete. Current total of ${itemId}s: ${toUpdate.amount}`;
    }
};


exports.distributeInputCash = (array, cash) => {
    return array.map(val => {
        let value = Math.round(val.value * 100) / 100;
        if (cash >= value) {
            let counter = 0;
            while (cash >= value) {
                cash -= value;
                cash = Math.round(cash * 100) / 100;
                counter += 1;
            }
            val.amount += counter;
            return val;
        } else {
            return val;
        }
    });
};

exports.distributeOutputChange = (array, change) => {
    return array.reduce((acc, val) => {
        // if cash is >= to the value of the current object we are in
        let value = Math.round(val.value * 100) / 100;
        if (change >= value) {
            let counter = 0;
            while (change >= value) {
                change -= value;
                change = Math.round(change * 100) / 100;
                counter += 1;
            }
            acc.push(
                `${counter} ${val.denom}s`
            );
            val.amount -= counter;
            return acc;
        } else {
            return acc;
        }
    }, []);
};
