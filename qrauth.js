// TODO: localstorage key format hostname/source/owner
// TODO: examples: alpx/crypttab/sdb3  alpx/luks/sdb3   alpx/pass/qrroot  alpx/pass/passwd
let lsHSS = 'hst/srv/src'; // hostName/serviceName/sorceName
let lsQrChunksQuantity = 'qrChunksQuantity';
let objHSS = {
  hostName1: {
    serviceName1: {
      sourceName1: {
        currentKey: 'theKeyString',
        previousKey: 'keyString',
        applyNewKey: 'keystring'
      }
    },
  }
}

function prepareControls() {

  let selHSS = $('#selHstSrvSrc');
  selHSS.html('');
  if (localStorage[lsHSS]) {
    objHSS = JSON.parse(localStorage[lsHSS]);
    for (let hst in objHSS)
      for (let srv in objHSS[hst])
        for (let src in objHSS[hst][srv]) {
          selHSS.append('<li><a class="dropdown-item" href="#">' + hst + '/' + srv + '/' + src + '</a></li>');
        }
  }
//  console.log(objHSS);

  function fillPasswordInputs(hss) {
    if (hss['currentKey'])
      inpCurrentPassword.val(hss['currentKey']);
    if (hss['previousKey'])
      $('#btnRevertPreviousPassword').removeClass('d-none');
    if (hss['applyNewKey']) {
      inpNewPassword.val(hss['applyNewKey']);
      btnSaveNewPassword.addClass('bg-danger');
    }
  }
  let inpKeySource = $('#inpKeySource');
  function passwordsFromSource(e, pass) {
    if (isQrCodeScannedFlag)
      return;
    let the = pass ? pass : $(this).html();
    inpKeySource.val(the);
    let arr = the.split('/');
    let obj = {hostName: arr[0], serviceName: arr[1], sourceName: arr[2]};
    let hss = objHSS[obj.hostName][obj.serviceName][obj.sourceName];
    fillPasswordInputs(hss);
    btnShowQrCode.find('svg').attr('fill', '#5aff00');
    lblQrShow.removeClass('d-none');
    lblQrCreate.addClass('d-none');
  }
  selHSS.find('a').click(passwordsFromSource);

  let progressBar = $('#progressBar');
  let btnShowCurrentPassword = $('#btnShowCurrentPassword');
  let btnShowNewPassword = $('#btnShowNewPassword');

  let labelOTPcode = $('#labelOTPcode');
  let inpNewLuksSecret = $('#inpNewLuksSecret');
  let inpCurrentPassword = $('#inpCurrentPassword');
  let inpNewPassword = $('#inpNewPassword');
  let btnShowQrCode = $('#btnShowQrCode');
  let btnSaveNewPassword = $('#btnSaveNewPassword');
  let btnScanSessionPubkey = $('#btnScanSessionPubkey');
  let btnUndoUserPasword = $('#btnUndoUserPasword');
  let lblQrCreate = $('#lblQrCreate');
  let lblQrShow = $('#lblQrShow');
  let lblScanQrCode = $('#lblScanQrCode');

  function showInputPassword(pass) {
    let the = $(this);
    console.log(the)
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
    TOTP6.generateSecretKey(inpCurrentPassword.val(), showInputPassword)
  });

  let currentOTPsecret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let refreshOtpintervalTimer = 0;
  let refreshOtpTimeout = 0;
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

    let timeout30sec = 30 - Math.floor((Date.now() / 1000) % 30);
    progressBar.css('width', Math.floor(timeout30sec/30*100)+'%');
    if (!$(qrCodeArea).hasClass('d-none')) {
      //if (refreshOtpTimeout) clearTimeout(refreshOtpTimeout);
      refreshOtpTimeout = setTimeout(refreshOtp, timeout30sec * 1000);
      if (refreshOtpintervalTimer)
        clearInterval(refreshOtpintervalTimer);
      refreshOtpintervalTimer = setInterval(function () {
        if (timeout30sec-- <= 0)
          clearInterval(refreshOtpintervalTimer);
        progressBar.css('width', (timeout30sec > 0 ? Math.floor(timeout30sec/30*100) : 100) +'%');
      },1000);
    } else {
      stopShowQRcode();
    }
  }
  function stopShowQRcode() {
    btnShowQrCode.find('svg').attr('fill', 'white');
    labelOTPcode.addClass('d-none');
    $(qrCodeArea).html('');
    $(qrCodeArea).addClass('d-none');
    progressBar.css('width', '0%');
    clearInterval(refreshOtpintervalTimer);
    clearTimeout(refreshOtpTimeout);
    passwordsFromSource(0, inpKeySource.val());
  }
  function btnShowAction() {
    if (lblQrShow.hasClass('d-none') && lblQrCreate.hasClass('d-none')) {
      inpKeySource.addClass('bg-danger');
      setTimeout(function () {
        inpKeySource.removeClass('bg-danger');
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

  btnUndoUserPasword.click(function () {
    inpCurrentPassword.val(localStorage[lsPrevUserPassName]);
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
    let obj = {qrcCodeFragment: arr[0], hostName: arr[1], serviceName: arr[2], sourceName: arr[3], pubkey: arr[4]};
    inpKeySource.val(obj.hostName + '/' + obj.serviceName + '/' + obj.sourceName);
    scanner.stop();
    $(qrCodeArea).html('');
    $(elQrCodeVideo).addClass('d-none');
    if (!objHSS[obj.hostName])
      objHSS[obj.hostName] = {};
    if (!objHSS[obj.hostName][obj.serviceName])
      objHSS[obj.hostName][obj.serviceName] = {};
    if (!objHSS[obj.hostName][obj.serviceName][obj.sourceName])
      objHSS[obj.hostName][obj.serviceName][obj.sourceName] = {};
    let hss = objHSS[obj.hostName][obj.serviceName][obj.sourceName];
    hss['publicKey'] = obj.pubkey;
    fillPasswordInputs(hss);
    btnShowQrCode.find('svg').attr('fill', 'yellow');
    btnScanSessionPubkey.find('svg').attr('fill', 'yellow');
    isQrCodeScannedFlag = 2;
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
    let arr = inpKeySource.val().split('/');
    let obj = {hostName: arr[0], serviceName: arr[1], sourceName: arr[2]};
    let hss = objHSS[obj.hostName][obj.serviceName][obj.sourceName];
    console.log(hss)
    let e= new age.Encrypter();
    e.addRecipient(hss.publicKey);
    let sendData = inpCurrentPassword.val();
    if (inpNewPassword.val() !== '')
      sendData += '\n' + inpNewPassword.val();
    console.log(sendData);
    e.encrypt(sendData).then(
      encryptedData => {
        $(qrCodeArea).removeClass('d-none');
        if (!hss['currentKey'] || hss['currentKey'] !== hss['previousKey'])
          hss['previousKey'] = hss['currentKey'];
        hss['currentKey'] = inpCurrentPassword.val();
        if (inpNewPassword.val() !== '') {
          btnSaveNewPassword.addClass('bg-danger');
          unlockButtonSaveNewPassword = true;
          hss['applyNewKey'] = inpNewPassword.val();
        }
        localStorage[lsHSS] = JSON.stringify(objHSS);
        const data = encryptedData.toBase64();
        let datalen = data.length;
        let numOfChunks = parseInt(localStorage[lsQrChunksQuantity], 10);
        console.log('numOfChunks:' + numOfChunks);
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
        console.log(datalen, chunklen, data);
        while (++i <= numOfChunks && chunklen) {
          let chunkStr = numOfChunksDigits.toString() + numOfChunks.toString() + ('00' + i).slice(-numOfChunksDigits) + data.substring(fulllen, fulllen+chunklen);
          console.log(i, fulllen, fulllen+chunklen, chunkStr);
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
        let qrInterval = setInterval(function () {
          if (inpNewPassword.val() !== '')
            btnSaveNewPassword[btnSaveNewPassword.hasClass('bg-danger') ? 'removeClass' : 'addClass'] ('bg-danger');
          $(qrImgPool[activeQrImgIdx++]).addClass('d-none');
          $(qrImgPool[activeQrImgIdx++]).addClass('d-none');
          if (activeQrImgIdx > qrImgPool.length-1)
            activeQrImgIdx = 0;
          $(qrImgPool[activeQrImgIdx]).removeClass('d-none');
          $(qrImgPool[activeQrImgIdx+1]).removeClass('d-none');
          if (--qrAnimationTimeout <= 0) {
            $(qrCodeArea).html('');
            $(qrCodeArea).addClass('d-none');
            $(elQrCodeVideo).addClass('d-none');
            btnShowQrCode.find('svg').attr('fill', 'white');
            btnScanSessionPubkey.find('svg').attr('fill', 'white');
            clearInterval(qrInterval);
            isQrCodeScannedFlag = 0;
          }
        },250);
      });
  }
  $(qrCodeArea).click(function () {
    if (qrAnimationTimeout)
      qrAnimationTimeout = 1;
    else
      stopShowQRcode();
  });
  async function scanQRcode() {
    isQrCodeScannedFlag = 1;
    stopShowQRcode();
    $(qrCodeArea).addClass('d-none');
    $(elQrCodeVideo).removeClass('d-none');
    lblQrCreate.removeClass('d-none');
    lblQrShow.addClass('d-none');
    if (!scanner)
      initScanner();
      //qrScanned({data:'alpx/pass/qrroot/111/age10p4m629am0238g6dh2lw9ent4qdp9ndh9m58y47ynql4g00nef7szs9rc0'});
    scanner.start().then(() => {});
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
  if (!localStorage[lsQrChunksQuantity])
    localStorage[lsQrChunksQuantity] = 6;
  qrChunksQuantity.html(localStorage[lsQrChunksQuantity]);
  function changeQrNumChunks() {
    if (lblQrCreate.hasClass('d-none'))
      return;
    let addsub = $(this).attr('data-bs-target') === '+' ? +1 : -1;
    let newval = parseInt(localStorage[lsQrChunksQuantity]) + addsub;
    if (newval > 1 && newval <= 62) {
      localStorage[lsQrChunksQuantity] = newval;
      qrChunksQuantity.html(localStorage[lsQrChunksQuantity]);
    }
  }
  btnQrChunksPlus.click(changeQrNumChunks);
  btnQrChunksMinus.click(changeQrNumChunks)

  btnScanSessionPubkey.click(scanQRcode);
  lblScanQrCode.click(scanQRcode);
  $('#btnScanSessionPubkey4pwd').click(scanQRcode);

  $('#btnGenerateNewPassword').click(function () {
    let prevPasskey = inpNewPassword.val();
    if (prevPasskey && prevPasskey.length < 32)
      inpNewPassword.val(prevPasskey + TOTP6.generatePassword(8));
    else
      inpNewPassword.val(TOTP6.generatePassword(8));
  });
  $('#btnClearNewLuksSecret').click(function () {
    $('#inpNewLuksSecret').val('');
    localStorage.removeItem(lsLuksNewKeyName);
    $(btnSaveNewPassword).removeClass('bg-danger');
    unlockButtonSaveNewPassword = false;
  });
  btnSaveNewPassword.click(async function () {
    if (unlockButtonSaveNewPassword || localStorage[lsLuksNewKeyName]) {
      localStorage.removeItem(lsLuksNewKeyName);
      localStorage[lsLuksKeyName] = inpNewLuksSecret.val();
      inpLuksSecret.val(localStorage[lsLuksKeyName]);
      inpNewLuksSecret.val('');
      $(this).removeClass('bg-danger');
      unlockButtonSaveNewPassword = false;
      generateOTPsecret();
    }
  });

  let b = $('body');
  b.css('zoom', Math.floor(window.innerWidth*100/b.width()) + '%');
}

$(document).ready(prepareControls);
