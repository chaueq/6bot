"use strict";

function sleep(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
}

function nextStage() {
  var stages, active, i;
  return regeneratorRuntime.async(function nextStage$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          stages = document.querySelectorAll('div.stage');
          active = null;
          i = 0;

        case 3:
          if (!(i < stages.length)) {
            _context.next = 10;
            break;
          }

          if (!stages[i].classList.contains('active_pt1')) {
            _context.next = 7;
            break;
          }

          active = i;
          return _context.abrupt("break", 10);

        case 7:
          ++i;
          _context.next = 3;
          break;

        case 10:
          if (!(active !== null)) {
            _context.next = 15;
            break;
          }

          stages[active].classList.remove('active_pt2');
          _context.next = 14;
          return regeneratorRuntime.awrap(sleep(1000));

        case 14:
          stages[active].classList.remove('active_pt1');

        case 15:
          active = active === null ? 0 : active + 1;
          stages[active].classList.add('active_pt1');
          _context.next = 19;
          return regeneratorRuntime.awrap(sleep(1));

        case 19:
          stages[active].classList.add('active_pt2');
          _context.next = 22;
          return regeneratorRuntime.awrap(sleep(1000));

        case 22:
        case "end":
          return _context.stop();
      }
    }
  });
}

window.addEventListener('load', nextStage);