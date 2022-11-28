function testObcy(search, obcy) {
    let result = !obcy.status.spam;
    let reason = undefined;

    if(result && search.sex != 0.5 && obcy.sex !== undefined) {
        result = (obcy.sex == search.sex);
        if(!result) {
            reason = 'sex';
        }
    }

    if(result && obcy.age !== undefined) {
        result = (obcy.age >= search.age.min);
        if(!result) {
            reason = 'too young';
        }
    }

    if(result && obcy.age !== undefined) {
        result = (obcy.age <= search.age.max);
        if(!result) {
            reason = 'too old';
        }
    }

    return {
      passed: result,
      reason: reason,
      spam: obcy.status.spam
    };
}