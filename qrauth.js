let lsHSD = 'hst/svc/dst'; // hostName/serviceName/destinationName
let lsQrChunksQuantity = 'qrChunksQuantity';
let emtyHSdst = {
  currentKey: '',
  previousKey: '',
  applyNewKey: ''
}
let objHSD = { // object description
  hostName1: {
    serviceName1: {
      destinationName1: emtyHSdst
    },
  }
}
let lsSelectedHSD = 'selectedHSD';
let selectedHSD = undefined;

function prepareControls() {

  let colorHighlightSuccess = $('.bg-success-highlight').css('background-color');
  let progressBar = $('#progressBar');
  let btnShowCurrentPassword = $('#btnShowCurrentPassword');
  let btnShowNewPassword = $('#btnShowNewPassword');

  let labelOTPcode = $('#labelOTPcode');
  let inpCurrentPassword = $('#inpCurrentPassword');
  let inpNewPassword = $('#inpNewPassword');
  let btnClearKeyDestination = $('#btnClearKeyDestination');
  let btnSaveNewPassword = $('#btnSaveNewPassword');
  let btnClearNewPassword = $('#btnClearNewPassword');
  let btnScanSessionPubkey = $('#btnScanSessionPubkey');
  let btnRevertPreviousPassword = $('#btnRevertPreviousPassword');
  let btnClearPassword = $('#btnClearPassword');
  let lblQrCreate = $('#lblQrCreate');
  let lblQrShow = $('#lblQrShow');
  let lblScanQrCode = $('#lblScanQrCode');
  let btnShowQrCode = $('#btnShowQrCode');
  let btnKeyDestList = $('#btnKeyDestList');
  let selHSD = $('#selHstSrvDst');
  let settingsArea = $('#settingsArea');
  let btnSettings = $('#btnSettings');
  let btnShowHelp = $('#btnShowHelp');
  let whatTheArea = $('#whatTheArea');
  let hsdHtmlTemplate = '<li id="#id"><a class="dropdown-item" href="#">#html</a></li>';
  let hsdHtmlTemplateBtn = '<li id="#id"><a class="dropdown-item disabled" aria-disabled="true" href="#">#html</a></li>';

  selHSD.html('');
  let isHSDnotEmpty = false;
  if (localStorage[lsHSD]) {
    objHSD = JSON.parse(localStorage[lsHSD]);
    for (let hst in objHSD)
      for (let svc in objHSD[hst])
        for (let dst in objHSD[hst][svc]) {
          let dest = hst+'/'+svc+'/'+dst;
          selHSD.append(hsdHtmlTemplate.replace('#id', dest.replaceAll('/','_')).replace('#html',dest));
          isHSDnotEmpty = true;
        }
    if (!isHSDnotEmpty)
      localStorage.removeItem(lsHSD);
  } else
    objHSD = {};
  if (isHSDnotEmpty) {
    btnKeyDestList.addClass('btn-outline-success bg-success-highlight');
    setTimeout(function () {
      btnKeyDestList.removeClass('btn-outline-secondary bg-success-highlight');
    },500);
    selHSD.append('<li><hr class="dropdown-divider"></li>');
    selHSD.append(hsdHtmlTemplateBtn.replace('#id', 'actSaveToFile').replace('#html', 'Save to file'));
    selHSD.append(hsdHtmlTemplateBtn.replace('#id', 'actLoadFromFile').replace('#html', 'Load from file'));
  }

  function fillPasswordInputs(hsd) {
    if (hsd['currentKey'])
      inpCurrentPassword.val(hsd['currentKey']);
    if (hsd['previousKey'] && hsd['previousKey'] !== hsd['currentKey'])
      btnRevertPreviousPassword.removeClass('d-none');
    if (hsd['applyNewKey']) {
      inpNewPassword.val(hsd['applyNewKey']);
      btnSaveNewPassword.addClass('bg-danger');
      btnSaveNewPassword.removeClass('d-none');
      btnClearNewPassword.removeClass('d-none');
    }
  }
  let inpKeyDest = $('#inpKeyDestination');
  inpKeyDest.focus(function () {
    if (selectedHSD)
      btnClearKeyDestination.removeClass('d-none');
  });
  inpKeyDest.blur(function () {
    btnClearKeyDestination.addClass('bg-danger');
    setTimeout(function () {
      btnClearKeyDestination.addClass('d-none');
      btnClearKeyDestination.removeClass('bg-danger');
    },250);
  });
  btnClearKeyDestination.click(function () {
    event.preventDefault();
    let tgt = inpKeyDest.val().replaceAll('/','');
    for (let hst in objHSD)
      for (let svc in objHSD[hst])
        for (let dst in objHSD[hst][svc])
          if (tgt === hst+svc+dst) {
            delete objHSD[hst][svc][dst];
            if ($.isEmptyObject(objHSD[hst][svc])) {
              delete objHSD[hst][svc];
              if ($.isEmptyObject(objHSD[hst])) {
                delete objHSD[hst];
              }
            }
            selectedHSD = undefined;
            localStorage[lsHSD] = JSON.stringify(objHSD);
            selHSD.find('#'+hst+'_'+svc+'_'+dst).remove();
            resetAllControls(1);
            break;
          }
  });
  function passwordsFromSource(e, pass) {
    if (event) event.preventDefault();
    if (isQrCodeScannedFlag) {
      if (isQrCodeScannedFlag === 2 && !pass) {
        let hsd = $(this).parent()[0].id.split('_');
        inpCurrentPassword.val(objHSD[hsd[0]][hsd[1]][hsd[2]]['currentKey']);
      }
      return;
    }
    let the = pass ? pass : $(this).html();
    inpKeyDest.val(the);
    let arr = the.split('/');
    let obj = {hostName: arr[0], serviceName: arr[1], destName: arr[2]};
    let dest = arr[0]+'/'+arr[1]+'/'+arr[2];
    localStorage[lsSelectedHSD] = arr[0]+'_'+arr[1]+'_'+arr[2];
    selectedHSD = objHSD[obj.hostName][obj.serviceName][obj.destName];
    fillPasswordInputs(selectedHSD);
    lblQrShow.removeClass('d-none');
    lblQrCreate.addClass('d-none');
    btnShowQrCode.find('svg').attr('fill', $('.bg-success').css('backgroundColor'));
    setTimeout(function () {
      btnShowQrCode.find('svg').attr('fill', colorHighlightSuccess);
    },250);
  }
  selHSD.find('a').click(passwordsFromSource);
  if (localStorage[lsSelectedHSD])
    setTimeout(function () {
      let selectedHSD = selHSD.find('#'+localStorage[lsSelectedHSD]);
      if (selectedHSD.length) $(selectedHSD[0]).find('a').click();
      else localStorage.removeItem(lsSelectedHSD);
    }, 200);

  function showInputPassword(pass) {
    if (event) event.preventDefault();
    let the = $(this);
    if (typeof pass === 'string') {
      inpCurrentPassword.val(pass);
      the = labelOTPcode;
    }
    let tgtInp = $(the.attr('data-bs-target'));
    let isHidden = (tgtInp.attr('type') === 'password');
    tgtInp.attr('type', isHidden ? 'text' : 'password');
    the[ isHidden ? 'addClass' : 'removeClass' ]('bg-danger');
  }
  btnShowCurrentPassword.click(showInputPassword);
  btnShowNewPassword.click(showInputPassword);
  labelOTPcode.click(function () {
    event.preventDefault();
    TOTP6.generateSecretKey(inpCurrentPassword.val(), showInputPassword)
  });


  let refreshOtpintervalTimer = 0;
  let refreshOtpTimeout = 0;
  function activateProgressBar(periodSeconds, intervalSeconds, callback) {
    progressBar.css('width', Math.floor(periodSeconds/intervalSeconds*100)+'%');
    //if (refreshOtpTimeout) clearTimeout(refreshOtpTimeout);
    if (callback === refreshOtp)
      refreshOtpTimeout = setTimeout(refreshOtp, periodSeconds * 1000);
    if (refreshOtpintervalTimer)
      clearInterval(refreshOtpintervalTimer);
    refreshOtpintervalTimer = setInterval(function () {
      if (periodSeconds-- <= 1) {
        clearInterval(refreshOtpintervalTimer);
        progressBar.css('width', '0%');
        if (callback) callback();
      } else
      progressBar.css('width', (periodSeconds > 0 ? Math.floor(periodSeconds/intervalSeconds*100) : 100) +'%');
    },1000);
  }

  let currentOTPsecret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let qrCodeArea = document.getElementById("qrCodeImgArea");
  async function refreshOtp(e, OTPsecret) {
    currentOTPsecret = OTPsecret ? OTPsecret : currentOTPsecret;
    let qrc = await TOTP6.genCode(currentOTPsecret);
    $(qrCodeArea).html('');
    let w = $('#cardArea').width();
    new QRCode(qrCodeArea, {
      text: qrc,
      width: w-40,
      height: w-40,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
    labelOTPcode.html(qrc);

    if (!$(qrCodeArea).hasClass('d-none')) {
      progressBar.removeClass('bg-warning');
      progressBar.addClass('bg-success');
      activateProgressBar(30 - Math.floor((Date.now() / 1000) % 30), 30, refreshOtp);
    } else
      stopShowQRcode();
  }
  function resetAllControls(force) {
    btnShowQrCode.find('svg').attr('fill', 'white');
    btnKeyDestList.addClass('btn-outline-success btn-outline-secondary');
    if (force) {
      inpKeyDest.val('');
      inpCurrentPassword.val('');
      inpNewPassword.val('');
      lblQrShow.addClass('d-none');
      lblQrCreate.addClass('d-none');
      btnRevertPreviousPassword.addClass('d-none');
      btnSaveNewPassword.addClass('d-none');
      btnClearNewPassword.addClass('d-none');
      btnShowQrCode.find('svg').attr('fill', 'black');
      btnScanSessionPubkey.find('svg').attr('fill', 'white');
      btnKeyDestList.removeClass('btn-outline-success');
    }
    labelOTPcode.addClass('d-none');
    $(qrCodeArea).html('');
    $(qrCodeArea).addClass('d-none');
    $(elQrCodeVideo).addClass('d-none');
    progressBar.css('width', '0%');
  }
  function stopShowQRcode(stReset) {
    resetAllControls();
    clearInterval(refreshOtpintervalTimer);
    clearTimeout(refreshOtpTimeout);
    passwordsFromSource(0, inpKeyDest.val());
    preventDoubleClick = false;
    isQrCodeScannedFlag = 0;
  }
  let preventDoubleClick = false;
  function btnShowAction() {
    console.log(this, event, preventDoubleClick);
    if (event) event.preventDefault();
    if (preventDoubleClick)
      return;
    preventDoubleClick = true;
    settingsArea.addClass('d-none');
    btnSettings.removeClass('bg-primary');
    whatTheArea.addClass('d-none');
    btnShowHelp.removeClass('bg-primary');
    if (lblQrShow.hasClass('d-none') && lblQrCreate.hasClass('d-none')) {
      inpKeyDest.addClass('bg-danger');
      setTimeout(function () {
        inpKeyDest.removeClass('bg-danger');
      }, 150);
      return;
    }
    if (inpCurrentPassword.val().length < 3) {
      inpCurrentPassword.addClass('bg-danger');
      setTimeout(function () {
        inpCurrentPassword.removeClass('bg-danger');
      }, 150);
      return;
    }
    if (isQrCodeScannedFlag === 1)
      return;
    if (isQrCodeScannedFlag === 2) {
      btnShowQrCode.find('svg').attr('fill', 'gray');
      btnScanSessionPubkey.find('svg').attr('fill', 'gray');
      showAnimatedQRcode();
      return;
    }
    let isHidden = $(qrCodeArea).hasClass('d-none');
    $(qrCodeArea)[ isHidden ? 'removeClass' : 'addClass' ]('d-none');
    if (isHidden) {
      let pass = inpCurrentPassword.val();
      btnShowQrCode.find('svg').attr('fill', 'gray');
      labelOTPcode.removeClass('d-none');
      TOTP6.generateSecretKey(pass, refreshOtp);
    } else
      stopShowQRcode();
  }
  lblQrShow.click(btnShowAction);
  lblQrCreate.click(btnShowAction);
  btnShowQrCode.click(btnShowAction);

  btnRevertPreviousPassword.click(function () {
    event.preventDefault();
    let doShowPrevPass = (inpCurrentPassword.val() !== selectedHSD.previousKey);
    inpCurrentPassword.val(selectedHSD[doShowPrevPass ? 'previousKey' : 'currentKey']);
    inpCurrentPassword[doShowPrevPass ? 'addClass' : 'removeClass']('text-danger');
    btnClearPassword[doShowPrevPass ? 'removeClass' : 'addClass']('d-none');
    btnRevertPreviousPassword.html(doShowPrevPass ? '&#8635;' : '&#8634;'); // 11118/8635 | 11119/8634
  });
  btnClearPassword.click(function () {
    event.preventDefault();
    inpCurrentPassword.val(selectedHSD.currentKey);
    inpCurrentPassword.removeClass('text-danger');
    btnClearPassword.addClass('d-none');
    btnRevertPreviousPassword.addClass('d-none');
    delete selectedHSD.previousKey;
    localStorage[lsHSD] = JSON.stringify(objHSD);
  });

  inpCurrentPassword.change(function () {
    if (inpCurrentPassword.val().length > 5) {
    }
  });

  let elQrCodeVideo = document.getElementById('qrCodeScannerVideo');
  let scanner = null;
  let unlockButtonSaveNewPassword = false;
  let isQrCodeScannedFlag = 0;
  async function qrScanned(resp) {
    let arr = resp.data.split('/');
    let obj = {
      qrcCodeFragment: arr[0],
      hostName: arr[1],
      serviceName: arr[2],
      destName: arr[3],
      usbIP: arr[4],
      pubkey: arr[5]
    };
    let path = obj.hostName + '/' + obj.serviceName + '/' + obj.destName;
    inpKeyDest.val(path);
    scanner.stop();
    $(qrCodeArea).html('');
    $(elQrCodeVideo).addClass('d-none');
    if (!objHSD[obj.hostName])
      objHSD[obj.hostName] = {};
    if (!objHSD[obj.hostName][obj.serviceName])
      objHSD[obj.hostName][obj.serviceName] = {};
    if (!objHSD[obj.hostName][obj.serviceName][obj.destName])
      objHSD[obj.hostName][obj.serviceName][obj.destName] = {};
    selectedHSD = objHSD[obj.hostName][obj.serviceName][obj.destName];
    selectedHSD['path'] = path;
    selectedHSD['usbIP'] = obj.usbIP;
    selectedHSD['publicKey'] = obj.pubkey;
    fillPasswordInputs(selectedHSD);
    btnShowQrCode.find('svg').attr('fill', 'yellow');
    btnScanSessionPubkey.find('svg').attr('fill', 'yellow');
    isQrCodeScannedFlag = 2;
    clearInterval(refreshOtpintervalTimer);
    progressBar.css('width', '0%');
  }
  function initScanner() {
    scanner = new QrScanner(elQrCodeVideo, qrScanned, {
        highlightScanRegion: true,
        highlightCodeOutline: true
      }
    );
  }
  let qrAnimationTimeout = 0;
  function showAnimatedQRcode() {
    let w = $('#mainContainer').width();
    let arr = inpKeyDest.val().split('/');
    let hsd = selectedHSD;
    let isNewDest = (!hsd['currentKey'] || inpKeyDest.val() !== selectedHSD.path);

    let e= new age.Encrypter();
    e.addRecipient(hsd.publicKey);
    let sendData = inpCurrentPassword.val();
    if (inpNewPassword.val() !== '')
      sendData += '\n' + inpNewPassword.val();
    e.encrypt(sendData).then(
      encryptedData => {
        $(qrCodeArea).removeClass('d-none');
        if (hsd['currentKey'] && hsd['currentKey'] !== hsd['previousKey'])
          hsd['previousKey'] = hsd['currentKey'];
        hsd['currentKey'] = inpCurrentPassword.val();
        if (inpNewPassword.val() !== '') {
          btnSaveNewPassword.addClass('bg-danger');
          btnSaveNewPassword.removeClass('d-none');
          btnClearNewPassword.removeClass('d-none');
          unlockButtonSaveNewPassword = true;
          hsd['applyNewKey'] = inpNewPassword.val();
        }
        delete hsd.publicKey;
        localStorage[lsHSD] = JSON.stringify(objHSD);
        let dest = selectedHSD.path;
        if (isNewDest)
          selHSD.append(hsdHtmlTemplate.replace('#id', dest.replaceAll('/','_')).replace('#html',dest));
        const data = encryptedData.toBase64();
        if (selectedHSD.usbIP !== '0.0.0.0') {
          let requrl = 'http://'+selectedHSD.usbIP+':54321/&'+data;
          //console.log(requrl);
          fetch(requrl,{mode: 'no-cors'}).then(response => {
            if (response.type === 'opaque')
              qrAnimationTimeout = 1;
          });
        }
        let datalen = data.length;
        let numOfChunks = parseInt(localStorage[lsQrChunksQuantity], 10);
        let numOfChunksDigits = (numOfChunks > 9) ? 2 : 1;
        let chunklen = Math.floor(datalen / numOfChunks);
        if (numOfChunks - datalen % chunklen < numOfChunks) {
          chunklen++;
          numOfChunks = Math.floor(datalen / chunklen);
          if (datalen % chunklen) numOfChunks++;
          numOfChunksDigits = (numOfChunks > 9) ? 2 : 1;
        }
        let fulllen = 0;
        let i = 0;
        $(qrCodeArea).html('');
        while (++i <= numOfChunks && chunklen) {
          let chunkStr =
            numOfChunksDigits.toString()
            + numOfChunks.toString()
            + ('00' + i).slice(-numOfChunksDigits)
            + data.substring(fulllen, fulllen+chunklen);
          new QRCode(qrCodeArea, {
            text: chunkStr,
            width: w-40,
            height: w-40,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });
          fulllen += chunklen;
          if (datalen - fulllen < chunklen)
            chunklen = datalen - fulllen;
        }
        let qrImgPool = $(qrCodeArea).find('canvas,img');
        qrImgPool.addClass('d-none');
        $(qrImgPool[0]).removeClass('d-none');
        $(qrImgPool[1]).removeClass('d-none');
        let activeQrImgIdx = 0;
        qrAnimationTimeout = 180;
        progressBar.css('width', '1000%');
        let qrInterval = setInterval(function () {
          if (inpNewPassword.val() !== '' && qrAnimationTimeout % 4 === 0)
            btnSaveNewPassword[btnSaveNewPassword.hasClass('bg-danger') ? 'removeClass' : 'addClass'] ('bg-danger');
          $(qrImgPool[activeQrImgIdx++]).addClass('d-none');
          $(qrImgPool[activeQrImgIdx++]).addClass('d-none'); // it is not repeated of prev line!
          if (activeQrImgIdx > qrImgPool.length-1)
            activeQrImgIdx = 0;
          $(qrImgPool[activeQrImgIdx]).removeClass('d-none');
          $(qrImgPool[activeQrImgIdx+1]).removeClass('d-none');
          if (--qrAnimationTimeout <= 0) {
            resetAllControls();
            btnShowQrCode.find('svg').attr('fill', colorHighlightSuccess);
            clearInterval(qrInterval);
            isQrCodeScannedFlag = 0;
            passwordsFromSource(0, inpKeyDest.val());
            preventDoubleClick = false;
          } else
          progressBar.css('width', Math.floor(qrAnimationTimeout/180*100) +'%');
        },250);
      });
  }
  $(qrCodeArea).click(function () {
    event.preventDefault();
    if (qrAnimationTimeout)
      qrAnimationTimeout = 1;
    else
      stopShowQRcode();
  });
  async function scanQRcode() {
    if (event) event.preventDefault();
    isQrCodeScannedFlag = 1;
    stopShowQRcode();
    $(qrCodeArea).addClass('d-none');
    $(elQrCodeVideo).removeClass('d-none');
    lblQrCreate.removeClass('d-none');
    lblQrShow.addClass('d-none');
    if (!scanner)
      initScanner();
    settingsArea.addClass('d-none');
    btnSettings.removeClass('bg-primary');
    whatTheArea.addClass('d-none');
    btnShowHelp.removeClass('bg-primary');
    scanner.start().then(() => {});
    progressBar.removeClass('bg-success');
    progressBar.addClass('bg-warning');
    activateProgressBar(15, 15, function () { // stop scanner cam in 15s of inactivity
      scanner.stop();
      $(elQrCodeVideo).addClass('d-none');
      stopShowQRcode();
    });
    /*if (inpCurrentPassword.val() !== '') {
    } else {
      inpCurrentPassword.addClass('bg-danger');
      setTimeout(function () {
        inpCurrentPassword.removeClass('bg-danger');
      }, 150);
    }*/
  }
  let btnQrChunksPlus = $('#btnQrChunksPlus');
  let btnQrChunksMinus = $('#btnQrChunksMinus');
  let qrChunksQuantity = $('#qrChunksQuantity');
  let lblQrChunksNumber = $('#lblQrChunksNumber');
  let inpQrChunksRange = $('#inpQrChunksRange');
  if (!localStorage[lsQrChunksQuantity])
    localStorage[lsQrChunksQuantity] = 6;
  qrChunksQuantity.html(localStorage[lsQrChunksQuantity]);
  lblQrChunksNumber.html(localStorage[lsQrChunksQuantity]);
  function changeQrNumChunks() {
    if (event) event.preventDefault();
    let addsub = $(this).attr('data-bs-target') === '+' ? +1 : -1;
    let newval = parseInt(localStorage[lsQrChunksQuantity]) + addsub;
    if (newval > 1 && newval <= 62) {
      inpQrChunksRange.val(newval);
      localStorage[lsQrChunksQuantity] = newval;
      qrChunksQuantity.html(localStorage[lsQrChunksQuantity]);
      lblQrChunksNumber.html(localStorage[lsQrChunksQuantity]);
    }
  }
  btnQrChunksPlus.click(changeQrNumChunks);
  btnQrChunksMinus.click(changeQrNumChunks);
  inpQrChunksRange.on('input', function () {
    localStorage[lsQrChunksQuantity] = $(this).val();
    qrChunksQuantity.html(localStorage[lsQrChunksQuantity]);
    lblQrChunksNumber.html(localStorage[lsQrChunksQuantity]);
  });

  btnScanSessionPubkey.click(scanQRcode);
  lblScanQrCode.click(scanQRcode);
  $('#btnScanSessionPubkey4pwd').click(scanQRcode);

  function showHideArea() {
    if (event) event.preventDefault();
    let the = $(this);
    let tgtEl = $(the.attr('data-bs-target'));
    var isHidden = !tgtEl.hasClass('d-none');
    the[ isHidden ? 'removeClass' : 'addClass' ]('bg-primary');
    tgtEl[ isHidden ? 'addClass' : 'removeClass' ]('d-none');
  }
  btnSettings.click(showHideArea);
  btnShowHelp.click(showHideArea);

  $('#btnGenerateNewPassword').click(function () {
    event.preventDefault();
    let currPass = inpNewPassword.val();
    if (!currPass || currPass.length >= 64) currPass = '';
    currPass = TOTP6.generatePassword(8) + currPass;
    inpNewPassword.val(currPass);
    $('#lblNewPasswordsLength').html('(' + currPass.length + ' chars)');
  });
  btnClearNewPassword.click(function () {
    event.preventDefault();
    $('#inpNewPassword').val('');
    delete selectedHSD.applyNewKey;
    localStorage[lsHSD] = JSON.stringify(objHSD);
    btnSaveNewPassword.removeClass('bg-danger');
    btnSaveNewPassword.addClass('d-none');
    btnClearNewPassword.addClass('d-none');
    $('#lblNewPasswordsLength').html('');
    unlockButtonSaveNewPassword = false;
  });
  btnSaveNewPassword.click(async function () {
    if (unlockButtonSaveNewPassword || selectedHSD['applyNewKey']) {
      if (selectedHSD['applyNewKey']) delete selectedHSD.applyNewKey;
      selectedHSD.currentKey = inpNewPassword.val();
      inpCurrentPassword.val(selectedHSD.currentKey);
      localStorage[lsHSD] = JSON.stringify(objHSD);
      inpNewPassword.val('');
      btnSaveNewPassword.removeClass('bg-danger');
      btnSaveNewPassword.addClass('d-none');
      btnClearNewPassword.addClass('d-none');
      unlockButtonSaveNewPassword = false;
    }
    event.preventDefault();
  });
  $('#btnUpdateVersion').click(function () {
    location.reload(true);
  });


  let b = $('body');
  b.css('zoom', Math.floor(window.innerWidth*100/b.width()) + '%');

  $('#btnPubkeyByUSB').click(async function () {
    /* TODO: may be next time...
    navigator.bluetooth.requestDevice({acceptAllDevices: true})
        .then(device => {
          device.gatt.connect().then(server => {
            server.getPrimaryService(0x1133).then(service => {
              service.getCharacteristic(0x2A4D).then(characteristic => {
                characteristic.startNotifications().addEventListener('characteristicvaluechanged',
                    function (e) {
                      console.log(e);
                    });
              })
            })
          })
          //device.addEventListener('gattserverdisconnected', onDisconnected);
        });*/
  });
}

$(document).ready(prepareControls);
