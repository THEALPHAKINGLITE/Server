let resetData = { count: 0 };
function incrementReset(reason) {
    resetData.count++;
    console.log(`[SYSTEM RESET] Reason: ${reason} | Total: ${resetData.count}`);
}
module.exports = { resetData, incrementReset };
