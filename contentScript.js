function copyStringToClipboard(str) {
    if (str === undefined || str === null || !str.trim()) {
        return
    }
    var el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function isJira() {
    return document.getElementsByTagName("body")[0].getAttribute("id") === 'jira'
}

function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

function getButtonParent() {
    let idContainers = document.getElementsByClassName('aui-nav-breadcrumbs');
    let ui_version = 0;
    if (idContainers && idContainers.length) {
        ui_version = 1
    }
    if (!idContainers || !idContainers.length) {
        idContainers = document.getElementsByClassName('BreadcrumbsItem__BreadcrumbsItemElement-sc-1hh8yo5-0');
        ui_version = 2;
    }
    if (!idContainers || !idContainers.length) {
        idContainers = document.getElementsByClassName('css-151rkes');
        ui_version = 3;
    }
    if (!idContainers || !idContainers.length) {
        return undefined;
    }


    switch (ui_version) {
        case 1:
            const containers = idContainers[idContainers.length - 1].getElementsByTagName('li');
            if (containers && containers.length) {
                return containers[containers.length - 1];
            }
            break;
        case 2:
            return idContainers[idContainers.length - 1]
        case 3:
            return idContainers[idContainers.length - 1]

    }
}

function refresh() {
    if (!isJira())
        return;



    const copyButton = document.createElement('button');
    copyButton.classList = ['copy-jira-id-button']
    copyButton.textContent = 'COPY JIRA ID'
    const pathElements = window.location.pathname.split('/');
    let jiraId = '';
    if (pathElements.length >= 3) {
        jiraId = pathElements[2];
    }

    copyButton.onclick = () => copyStringToClipboard(jiraId);
    const buttonParent = getButtonParent();
    if (buttonParent) {
        let existingButtons = document.getElementsByClassName('copy-jira-id-button');

        for (button of existingButtons) {
            button.remove();
        }
        buttonParent.append(copyButton)
    } else {
        console.log('Copy JIRA ID => Something went wrong. Report to https://github.com/AdeshAtole/copy-jira-id/issues/new')
    }
}

console.log('Hello from \'Copy JIRA ID\'')
refresh()

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (!mutation.addedNodes) {
            return;
        }
        for (var i = 0; i < mutation.addedNodes.length; i++) {
            if (mutation.addedNodes[i].classList
                && !mutation.addedNodes[i].classList.contains("copy-jira-id-button")
            ) {
                debounce(refresh, 500)();
            }
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});