import { Component, OnInit, ViewChild } from '@angular/core';
import { timer } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';

function highLightElement(e) {
  var ele = e.target;
  ele.classList.toggle('clicked');
}

@Component({
  selector: 'kd-rbdy',
  templateUrl: './rbdy.component.html',
  styleUrls: ['./rbdy.component.scss'],
})
export class RbdyComponent implements OnInit {
  elm: Elm;
  html: string;
  @ViewChild('rbdy') rbdyEl;
  constructor(public dS: DataService) {}

  ngOnInit(): void {
    this.dS.subject.viewElement.subscribe((elm) => {
      this.elm = elm;
      this.html = elm.txts.rbdy;

      let delay = timer(500).subscribe((t) => {
        for (const it of this.rbdyEl.nativeElement.children) {
          it.classList.add('hover-pointer');
          it.addEventListener('click', highLightElement);
        }

        console.log(this.rbdyEl.nativeElement);
      });
    });
  }

  convert() {
    let elms = [],
      nodes = [],
      refs,
      bdys,
      equs,
      imgs;

    for (const it of this.rbdyEl.nativeElement.children) {
      if (it.classList.contains('clicked')) {
        nodes.push(it);
      }
    }

    for (const it of nodes) {
    }
  }
}
