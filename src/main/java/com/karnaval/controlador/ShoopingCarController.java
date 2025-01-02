package com.karnaval.controlador;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
@RequestMapping(path = "/shoopingCar")
public class ShoopingCarController {
	
	@GetMapping("/openCar")
	public String showShoopingCarView(Model model) {
		
		return "shoopingCar/shoopingCarView";
	}
}
