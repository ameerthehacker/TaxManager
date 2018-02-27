import { Component, OnInit } from "@angular/core";

import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: "tm-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  sheets: Array<any> = [];
  sheetDetails = {};

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.get("sheets").then(result => {
      if (!result.err) {
        this.sheets = result.sheets;
        // Load the last sheet available
        if (this.sheets.length >= 1) {
          this.loadSheet(this.sheets[this.sheets.length - 1].id);
        }
      }
    });
  }

  onSelectedSheetChange(evt) {
    if (evt.target.selectedIndex != -1) {
      const sheetId = evt.target.options[evt.target.selectedIndex].value;
      this.loadSheet(sheetId);
    }
  }

  loadSheet(id: string) {
    let sheet: any = {};
    let blanceSheet = {};

    this.auth.get(`sheets/${id}`).then(result => {
      if (!result.error) {
        // Set the list of available taxes
        sheet.availableTaxes = result.sheet.availableTaxes;
        // Set the houses
        sheet.availableHouses = result.sheet.availableHouses;
        sheet.availableHouses.forEach(availableHouse => {
          blanceSheet[availableHouse.id] = {
            owner_name: availableHouse.owner_name,
            taxes: {}
          };
        });

        result.sheet.currentBalanceSheet.forEach(details => {
          blanceSheet[details.house_id].taxes[details.tax_id] = {
            name: details.tax,
            currentYear: details.amount
          };
        });

        result.sheet.previousBalanceSheet.forEach(details => {
          if (blanceSheet[details.house_id].taxes[details.tax_id]) {
            blanceSheet[details.house_id].taxes[details.tax_id].previousYear =
              details.balance;
          } else {
            blanceSheet[details.house_id].taxes[details.tax_id] = {
              name: details.tax,
              previousYear: details.balance
            };
          }
        });
        sheet.balanceSheet = blanceSheet;
        this.sheetDetails = sheet;
      }
    });
  }
}
