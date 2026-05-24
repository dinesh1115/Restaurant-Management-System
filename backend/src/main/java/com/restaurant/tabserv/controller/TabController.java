package com.restaurant.tabserv.controller;

import com.restaurant.tabserv.exception.ApiException;
import com.restaurant.tabserv.model.TabDocument;
import com.restaurant.tabserv.service.TabService;
import com.restaurant.tabserv.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tabs")
public class TabController {

    private final TabService tabService;

    public TabController(TabService tabService) {
        this.tabService = tabService;
    }

    @PostMapping("/add_tab")
    public Map<String, Object> addTab(@RequestBody TabDocument tab) {
        return tabService.addTab(tab, SecurityUtils.getCurrentUser());
    }

    @DeleteMapping("/delete_tab/{tabName}")
    public Map<String, String> deleteTab(@PathVariable String tabName) {
        return tabService.deleteTab(tabName, SecurityUtils.getCurrentUser());
    }

    @PutMapping("/update_tab_name/{oldName}")
    public Map<String, String> updateTabName(
            @PathVariable String oldName,
            @RequestBody Map<String, String> body) {
        String newName = body.get("new_name");
        if (newName == null || newName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New name is required");
        }
        return tabService.updateTabName(oldName, newName, SecurityUtils.getCurrentUser());
    }

    @PutMapping("/update_table/{tabName}")
    public Map<String, String> updateTable(
            @PathVariable String tabName,
            @RequestParam int table) {
        return tabService.updateTable(tabName, table, SecurityUtils.getCurrentUser());
    }

    @GetMapping("/list_tabs")
    public List<TabDocument> listTabs() {
        return tabService.listTabs();
    }

    @PutMapping("/call_waiter/{tabName}")
    public Map<String, String> callWaiter(
            @PathVariable String tabName,
            @RequestParam String waiter_text) {
        return tabService.callWaiter(tabName, waiter_text);
    }

    @PutMapping("/clear_waiter/{tabName}")
    public Map<String, String> clearWaiter(@PathVariable String tabName) {
        return tabService.clearWaiter(tabName);
    }

    @PutMapping("/call_support/{tabName}")
    public Map<String, String> callSupport(
            @PathVariable String tabName,
            @RequestParam String support_text) {
        return tabService.callSupport(tabName, support_text);
    }

    @PutMapping("/clear_support/{tabName}")
    public Map<String, String> clearSupport(@PathVariable String tabName) {
        return tabService.clearSupport(tabName);
    }
}
