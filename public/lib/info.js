const state = {'what-is-this': true, 'how-it-works': false,};

function style() {
    const menuheight = document.querySelector('.menuHeader').clientHeight;
    const infoContainer = document.querySelector('#info-container');
    infoContainer.style.top = `${menuheight + 20}px`;
    infoContainer.style.zIndex = 2;
}

function init() {
    style();
    const whatIsThisContent = document.querySelector('.info-content-item.what-is-this');
    const whatIsThisTab = document.querySelector('#info-content .tabs .what-is-this');
    const howItWorksContent = document.querySelector('.info-content-item.how-it-works');
    const howItWorksTab = document.querySelector('#info-content .tabs .how-it-works');

    whatIsThisTab.addEventListener('click',
        () => enableState('what-is-this',
            [whatIsThisTab, howItWorksTab], [whatIsThisContent, howItWorksContent]))
    howItWorksTab.addEventListener('click',
        () => enableState('how-it-works',
            [whatIsThisTab, howItWorksTab], [whatIsThisContent, howItWorksContent]))

}

function enableState(enabledStateKey, tabElems, contentElems) {
    for (let key in Object.keys(state)) {
        state[key] = false;
    }
    state[enabledStateKey] = true;

    for (let tab of tabElems) {
        if (tab.classList.contains(enabledStateKey)) {
            tab.classList.add('is-active');
        }
        else {
            tab.classList.remove('is-active');
        }
    }

    for (let elem of contentElems) {
        if (elem.classList.contains(enabledStateKey)) {
            elem.classList.add('active');
        }
        else {
            elem.classList.remove('active');
        }
    }
}

export default init;
