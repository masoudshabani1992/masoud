(function () {
  'use strict';

  var form = document.getElementById('wts-form');
  var tabs = document.getElementById('wts-tabs');
  var toastEl = document.getElementById('wts-toast');
  if (!form || typeof WTS === 'undefined') {
    return;
  }

  function toast(msg, isError) {
    toastEl.hidden = false;
    toastEl.textContent = msg;
    toastEl.classList.toggle('is-error', !!isError);
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () {
      toastEl.hidden = true;
    }, 3200);
  }

  function payloadFromForm() {
    var data = {};
    var elements = form.querySelectorAll('input, textarea');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (!el.name) {
        continue;
      }
      if (el.type === 'checkbox') {
        data[el.name] = el.checked ? '1' : '0';
        continue;
      }
      if (el.type === 'hidden') {
        if (typeof data[el.name] === 'undefined') {
          data[el.name] = el.value;
        }
        continue;
      }
      data[el.name] = el.value;
    }
    return data;
  }

  function post(action, extra) {
    var body = new FormData();
    body.append('action', action);
    body.append('nonce', WTS.nonce);
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        if (typeof extra[k] === 'object') {
          Object.keys(extra[k]).forEach(function (sk) {
            body.append(k + '[' + sk + ']', extra[k][sk]);
          });
        } else {
          body.append(k, extra[k]);
        }
      });
    }
    return fetch(WTS.ajax, { method: 'POST', credentials: 'same-origin', body: body }).then(function (r) {
      return r.json();
    });
  }

  function setBusy(btn, busy) {
    if (!btn) {
      return;
    }
    btn.disabled = !!busy;
  }

  tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-tab]');
    if (!btn) {
      return;
    }
    tabs.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    document.querySelectorAll('.wts-panel').forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-panel') === btn.getAttribute('data-tab'));
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = document.getElementById('wts-save');
    setBusy(btn, true);
    post('wts_save', { settings: payloadFromForm() })
      .then(function (res) {
        if (res && res.success) {
          toast(WTS.i18n.saved);
        } else {
          toast(WTS.i18n.error, true);
        }
      })
      .catch(function () {
        toast(WTS.i18n.error, true);
      })
      .then(function () {
        setBusy(btn, false);
      });
  });

  document.getElementById('wts-turbo').addEventListener('click', function () {
    if (!window.confirm(WTS.i18n.confirm)) {
      return;
    }
    var btn = this;
    setBusy(btn, true);
    post('wts_turbo')
      .then(function (res) {
        if (res && res.success) {
          toast(WTS.i18n.turbo);
          window.setTimeout(function () {
            window.location.reload();
          }, 700);
        } else {
          toast(WTS.i18n.error, true);
          setBusy(btn, false);
        }
      })
      .catch(function () {
        toast(WTS.i18n.error, true);
        setBusy(btn, false);
      });
  });

  document.getElementById('wts-purge').addEventListener('click', function () {
    var btn = this;
    setBusy(btn, true);
    post('wts_purge')
      .then(function (res) {
        if (res && res.success) {
          toast(WTS.i18n.purged);
          if (res.data && res.data.stats) {
            var files = document.getElementById('wts-cache-files');
            if (files) {
              files.textContent = res.data.stats.files || 0;
            }
          }
        } else {
          toast(WTS.i18n.error, true);
        }
      })
      .catch(function () {
        toast(WTS.i18n.error, true);
      })
      .then(function () {
        setBusy(btn, false);
      });
  });

  var dropin = document.getElementById('wts-dropin');
  if (dropin) {
    dropin.addEventListener('click', function () {
      var btn = this;
      setBusy(btn, true);
      post('wts_dropin')
        .then(function (res) {
          if (res && res.success) {
            toast('Drop-in نصب شد. اگر WP_CACHE اضافه نشد، دستی در wp-config.php بگذارید: define(\'WP_CACHE\', true);');
            window.setTimeout(function () {
              window.location.reload();
            }, 900);
          } else {
            toast(WTS.i18n.error, true);
            setBusy(btn, false);
          }
        })
        .catch(function () {
          toast(WTS.i18n.error, true);
          setBusy(btn, false);
        });
    });
  }

  function cleanDb(task) {
    return post('wts_db_cleanup', { task: task }).then(function (res) {
      if (res && res.success) {
        var total = res.data && res.data.total ? res.data.total : 0;
        toast(WTS.i18n.cleaned + ' (' + total + ')');
        window.setTimeout(function () {
          window.location.reload();
        }, 800);
      } else {
        toast(WTS.i18n.error, true);
      }
    });
  }

  document.querySelectorAll('.wts-db-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBusy(btn, true);
      cleanDb(btn.getAttribute('data-task')).catch(function () {
        toast(WTS.i18n.error, true);
      }).then(function () {
        setBusy(btn, false);
      });
    });
  });

  var allBtn = document.getElementById('wts-db-all');
  if (allBtn) {
    allBtn.addEventListener('click', function () {
      if (!window.confirm('همه موارد قابل پاکسازی حذف شوند؟')) {
        return;
      }
      setBusy(allBtn, true);
      cleanDb('all').catch(function () {
        toast(WTS.i18n.error, true);
      }).then(function () {
        setBusy(allBtn, false);
      });
    });
  }
})();
