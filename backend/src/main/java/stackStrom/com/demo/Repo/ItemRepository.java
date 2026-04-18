package com.retail.ordering.repository;

import com.retail.ordering.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByCategory(String category);


    List<Item> findByStockGreaterThan(int minStock);
}
