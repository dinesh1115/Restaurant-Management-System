package com.restaurant.tabserv.service;

import com.restaurant.tabserv.exception.ApiException;
import com.restaurant.tabserv.model.TabDocument;
import com.restaurant.tabserv.repository.TabRepository;
import com.restaurant.tabserv.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TabService {

    private final TabRepository tabRepository;

    public TabService(TabRepository tabRepository) {
        this.tabRepository = tabRepository;
    }

    public Map<String, Object> addTab(TabDocument tab, AuthenticatedUser currentUser) {
        String userType = currentUser.getUserType();
        if (!isAdminOrManager(userType)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins and managers can add tabs.");
        }

        if (tabRepository.existsByName(tab.getName())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tab name already exists.");
        }

        tab.setUser(currentUser.getUsername());
        tab.setUserType(userType);
        TabDocument saved = tabRepository.save(tab);

        Map<String, Object> tabResponse = new HashMap<>();
        tabResponse.put("name", saved.getName());
        tabResponse.put("user", saved.getUser());
        tabResponse.put("user_type", saved.getUserType());
        tabResponse.put("table", saved.getTable());
        tabResponse.put("waiter_request", saved.isWaiterRequest());
        tabResponse.put("waiter_text", saved.getWaiterText());
        tabResponse.put("support_request", saved.isSupportRequest());
        tabResponse.put("support_text", saved.getSupportText());

        return Map.of(
                "message", "Tab added successfully",
                "tab", tabResponse
        );
    }

    public Map<String, String> deleteTab(String tabName, AuthenticatedUser currentUser) {
        if (!isAdminOrManager(currentUser.getUserType())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins and managers can delete tabs.");
        }

        if (!tabRepository.existsByName(tabName)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Tab not found.");
        }

        tabRepository.deleteByName(tabName);
        return Map.of("message", "Tab deleted successfully");
    }

    public Map<String, String> updateTabName(String oldName, String newName, AuthenticatedUser currentUser) {
        if (!isAdminOrManager(currentUser.getUserType())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins and managers can update tabs.");
        }

        if (tabRepository.existsByName(newName)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New tab name already exists.");
        }

        TabDocument tab = tabRepository.findByName(oldName)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tab not found."));
        tab.setName(newName);
        tabRepository.save(tab);
        return Map.of("message", "Tab name updated successfully");
    }

    public Map<String, String> updateTable(String tabName, int table, AuthenticatedUser currentUser) {
        TabDocument tab = tabRepository.findByName(tabName)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tab not found."));
        tab.setTable(table);
        tab.setUser(currentUser.getUsername());
        tab.setUserType(currentUser.getPrivilege());
        tabRepository.save(tab);
        return Map.of("message", "Table number updated successfully");
    }

    public List<TabDocument> listTabs() {
        return tabRepository.findAll();
    }

    public Map<String, String> callWaiter(String tabName, String waiterText) {
        return updateTabFlags(tabName, true, waiterText, null, null);
    }

    public Map<String, String> clearWaiter(String tabName) {
        return updateTabFlags(tabName, false, "", null, null);
    }

    public Map<String, String> callSupport(String tabName, String supportText) {
        return updateTabFlags(tabName, null, null, true, supportText);
    }

    public Map<String, String> clearSupport(String tabName) {
        return updateTabFlags(tabName, null, null, false, "");
    }

    private Map<String, String> updateTabFlags(
            String tabName,
            Boolean waiterRequest,
            String waiterText,
            Boolean supportRequest,
            String supportText) {

        TabDocument tab = tabRepository.findByName(tabName)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tab not found."));

        if (waiterRequest != null) {
            tab.setWaiterRequest(waiterRequest);
            tab.setWaiterText(waiterText != null ? waiterText : "");
        }
        if (supportRequest != null) {
            tab.setSupportRequest(supportRequest);
            tab.setSupportText(supportText != null ? supportText : "");
        }

        tabRepository.save(tab);

        if (waiterRequest != null && waiterRequest) {
            return Map.of("message", "Waiter called successfully");
        }
        if (waiterRequest != null) {
            return Map.of("message", "Waiter request cleared successfully");
        }
        if (supportRequest != null && supportRequest) {
            return Map.of("message", "Support called successfully");
        }
        return Map.of("message", "Support request cleared successfully");
    }

    private boolean isAdminOrManager(String userType) {
        return "admin".equals(userType) || "Manager".equals(userType);
    }
}
