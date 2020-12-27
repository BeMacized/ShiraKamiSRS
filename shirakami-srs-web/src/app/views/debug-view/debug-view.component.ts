import { Component, OnInit } from '@angular/core';
import {ThemeService} from '../../services/theme.service';

@Component({
  selector: 'app-debug-view',
  templateUrl: './debug-view.component.html',
  styleUrls: ['./debug-view.component.scss']
})
export class DebugViewComponent implements OnInit {

  constructor(public themeService: ThemeService) { }

  ngOnInit(): void {
  }

}
